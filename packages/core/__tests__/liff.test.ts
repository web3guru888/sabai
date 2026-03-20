import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @line/liff
const liffMock = {
  init: vi.fn().mockResolvedValue(undefined),
  isLoggedIn: vi.fn().mockReturnValue(true),
  isInClient: vi.fn().mockReturnValue(false),
  getProfile: vi.fn().mockResolvedValue({
    userId: 'test-user',
    displayName: 'Test User',
    pictureUrl: 'https://example.com/pic.jpg',
    statusMessage: 'Hello',
  }),
  getAccessToken: vi.fn().mockReturnValue('test-access-token'),
  getIDToken: vi.fn().mockReturnValue('test-id-token'),
  login: vi.fn(),
  logout: vi.fn(),
  isApiAvailable: vi.fn().mockReturnValue(true),
  shareTargetPicker: vi.fn().mockResolvedValue(undefined),
  use: vi.fn(),
};

vi.mock('@line/liff', () => ({
  default: liffMock,
}));

vi.mock('@line/liff-mock', () => ({
  default: class LiffMockPlugin {},
}));

// Mock window.location.reload
const reloadMock = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: reloadMock },
  writable: true,
});

describe('LIFF Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset modules to clear the cached initPromise singleton
    vi.resetModules();
    // Restore default mock implementations (clearAllMocks doesn't reset implementations)
    liffMock.init.mockResolvedValue(undefined);
    liffMock.isLoggedIn.mockReturnValue(true);
    liffMock.isInClient.mockReturnValue(false);
    liffMock.getProfile.mockResolvedValue({
      userId: 'test-user',
      displayName: 'Test User',
      pictureUrl: 'https://example.com/pic.jpg',
      statusMessage: 'Hello',
    });
    liffMock.getAccessToken.mockReturnValue('test-access-token');
    liffMock.getIDToken.mockReturnValue('test-id-token');
  });

  describe('initLiff', () => {
    it('returns correct state on success when logged in', async () => {
      liffMock.isLoggedIn.mockReturnValue(true);
      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'test-liff-id' });

      expect(liffMock.init).toHaveBeenCalledWith({ liffId: 'test-liff-id' });
      expect(state.isReady).toBe(true);
      expect(state.isLoggedIn).toBe(true);
      expect(state.isInClient).toBe(false);
      expect(state.profile).toEqual({
        userId: 'test-user',
        displayName: 'Test User',
        pictureUrl: 'https://example.com/pic.jpg',
        statusMessage: 'Hello',
      });
      expect(state.error).toBeNull();
    });

    it('returns state without profile when not logged in', async () => {
      liffMock.isLoggedIn.mockReturnValue(false);
      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'test-liff-id' });

      expect(state.isReady).toBe(true);
      expect(state.isLoggedIn).toBe(false);
      expect(state.profile).toBeNull();
    });

    it('deduplicates — calling twice returns same promise and only calls init once', async () => {
      liffMock.isLoggedIn.mockReturnValue(true);
      const { initLiff } = await import('../src/liff');

      const promise1 = initLiff({ liffId: 'test-liff-id' });
      const promise2 = initLiff({ liffId: 'test-liff-id' });

      // Both should resolve to the same state
      const [state1, state2] = await Promise.all([promise1, promise2]);
      expect(state1).toEqual(state2);
      // init should only be called once
      expect(liffMock.init).toHaveBeenCalledTimes(1);
    });

    it('activates liff-mock plugin when mockMode is true', async () => {
      liffMock.isLoggedIn.mockReturnValue(true);
      const { initLiff } = await import('../src/liff');

      await initLiff({ liffId: 'test-liff-id', mockMode: true });

      expect(liffMock.use).toHaveBeenCalledTimes(1);
    });

    it('does not use mock plugin when mockMode is false', async () => {
      liffMock.isLoggedIn.mockReturnValue(true);
      const { initLiff } = await import('../src/liff');

      await initLiff({ liffId: 'test-liff-id', mockMode: false });

      expect(liffMock.use).not.toHaveBeenCalled();
    });

    it('retries on transient failure and succeeds', async () => {
      liffMock.init
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(undefined);
      liffMock.isLoggedIn.mockReturnValue(true);

      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'test-liff-id' });

      expect(state.isReady).toBe(true);
      expect(liffMock.init).toHaveBeenCalledTimes(2);
    });

    it('fails immediately on non-retryable INVALID_ARGUMENT error', async () => {
      const error = new Error('Invalid argument');
      (error as Error & { code: string }).code = 'INVALID_ARGUMENT';
      liffMock.init.mockRejectedValue(error);

      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'bad-liff-id' });

      expect(state.isReady).toBe(false);
      expect(state.error).toBeTruthy();
      expect(state.error?.message).toBe('Invalid argument');
      // Should only try once for non-retryable errors
      expect(liffMock.init).toHaveBeenCalledTimes(1);
    });

    it('fails immediately on non-retryable UNAUTHORIZED error', async () => {
      const error = new Error('Unauthorized');
      (error as Error & { code: string }).code = 'UNAUTHORIZED';
      liffMock.init.mockRejectedValue(error);

      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'test-liff-id' });

      expect(state.isReady).toBe(false);
      expect(state.error?.message).toBe('Unauthorized');
      expect(liffMock.init).toHaveBeenCalledTimes(1);
    });

    it('handles profile fetch failure gracefully', async () => {
      liffMock.isLoggedIn.mockReturnValue(true);
      liffMock.getProfile.mockRejectedValueOnce(new Error('Profile error'));

      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'test-liff-id' });

      expect(state.isReady).toBe(true);
      expect(state.isLoggedIn).toBe(true);
      expect(state.profile).toBeNull();
    });

    it('returns error state after all retries exhausted', async () => {
      liffMock.init.mockRejectedValue(new Error('Persistent error'));

      const { initLiff } = await import('../src/liff');

      const state = await initLiff({ liffId: 'test-liff-id' });

      expect(state.isReady).toBe(false);
      expect(state.error?.message).toBe('Persistent error');
      // Should have tried 3 times (MAX_RETRIES)
      expect(liffMock.init).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAccessToken', () => {
    it('returns access token after init', async () => {
      const { getAccessToken } = await import('../src/liff');

      const token = await getAccessToken();
      expect(token).toBe('test-access-token');
    });

    it('returns null on failure', async () => {
      liffMock.getAccessToken.mockImplementationOnce(() => {
        throw new Error('Not initialized');
      });

      const { getAccessToken } = await import('../src/liff');
      const token = await getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('getIdToken', () => {
    it('returns ID token after init', async () => {
      const { getIdToken } = await import('../src/liff');

      const token = await getIdToken();
      expect(token).toBe('test-id-token');
    });

    it('returns null on failure', async () => {
      liffMock.getIDToken.mockImplementationOnce(() => {
        throw new Error('Not initialized');
      });

      const { getIdToken } = await import('../src/liff');
      const token = await getIdToken();
      expect(token).toBeNull();
    });
  });

  describe('login', () => {
    it('triggers liff.login', async () => {
      const { login } = await import('../src/liff');

      await login();
      expect(liffMock.login).toHaveBeenCalledWith({ redirectUri: undefined });
    });

    it('triggers liff.login with redirectUri', async () => {
      const { login } = await import('../src/liff');

      await login('https://example.com/callback');
      expect(liffMock.login).toHaveBeenCalledWith({ redirectUri: 'https://example.com/callback' });
    });
  });

  describe('logout', () => {
    it('triggers liff.logout and window.location.reload', async () => {
      const { logout } = await import('../src/liff');

      await logout();
      expect(liffMock.logout).toHaveBeenCalled();
      expect(reloadMock).toHaveBeenCalled();
    });
  });

  describe('isInClient', () => {
    it('returns liff.isInClient value', async () => {
      liffMock.isInClient.mockReturnValue(true);
      const { isInClient } = await import('../src/liff');

      const result = await isInClient();
      expect(result).toBe(true);
    });
  });
});
