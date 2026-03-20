import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OmiseClient } from '../src/omise';

// Mock global fetch
const fetchMock = vi.fn();
global.fetch = fetchMock;

describe('OmiseClient', () => {
  const config = {
    publicKey: 'pkey_test_1234567890',
    secretKey: 'skey_test_1234567890',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('constructor', () => {
    it('constructs with public and secret key', () => {
      const client = new OmiseClient(config);
      expect(client).toBeDefined();
      expect(client.getPublicKey()).toBe('pkey_test_1234567890');
    });

    it('constructs with only public key (client-side)', () => {
      const client = new OmiseClient({ publicKey: 'pkey_test_1234567890' });
      expect(client.getPublicKey()).toBe('pkey_test_1234567890');
    });

    it('throws if publicKey is missing', () => {
      expect(() => new OmiseClient({ publicKey: '' })).toThrow('Omise publicKey is required');
    });
  });

  describe('createCharge', () => {
    it('requires secret key', async () => {
      const client = new OmiseClient({ publicKey: 'pkey_test' });

      await expect(
        client.createCharge({
          amount: 10000,
          currency: 'thb',
          card: 'tokn_test_xxx',
        }),
      ).rejects.toThrow('Omise secret key is required for createCharge');
    });

    it('sends correct request to Omise API', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'chrg_test_001',
          amount: 10000,
          currency: 'thb',
          status: 'successful',
          paid: true,
        }),
      });

      const client = new OmiseClient(config);

      const charge = await client.createCharge({
        amount: 10000,
        currency: 'thb',
        card: 'tokn_test_xxx',
        description: 'Test charge',
      });

      expect(fetchMock).toHaveBeenCalledTimes(1);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.omise.co/charges');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['Authorization']).toContain('Basic');

      // Verify Basic auth encoding
      const expectedAuth = btoa('skey_test_1234567890:');
      expect(options.headers['Authorization']).toBe(`Basic ${expectedAuth}`);

      const body = JSON.parse(options.body);
      expect(body.amount).toBe(10000);
      expect(body.currency).toBe('thb');
      expect(body.card).toBe('tokn_test_xxx');

      expect(charge.id).toBe('chrg_test_001');
      expect(charge.status).toBe('successful');
      expect(charge.paid).toBe(true);
    });

    it('throws on API error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        text: vi.fn().mockResolvedValue('invalid_card'),
      });

      const client = new OmiseClient(config);

      await expect(
        client.createCharge({
          amount: 10000,
          currency: 'thb',
          card: 'tokn_test_bad',
        }),
      ).rejects.toThrow('Omise API error: 422 Unprocessable Entity — invalid_card');
    });
  });

  describe('getCharge', () => {
    it('retrieves charge by ID', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          id: 'chrg_test_001',
          amount: 10000,
          currency: 'thb',
          status: 'successful',
          paid: true,
        }),
      });

      const client = new OmiseClient(config);
      const charge = await client.getCharge('chrg_test_001');

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.omise.co/charges/chrg_test_001');
      expect(options.method).toBe('GET');
      expect(charge.id).toBe('chrg_test_001');
    });

    it('requires secret key', async () => {
      const client = new OmiseClient({ publicKey: 'pkey_test' });

      await expect(client.getCharge('chrg_test_001')).rejects.toThrow(
        'Omise secret key is required for getCharge',
      );
    });

    it('throws if chargeId is empty', async () => {
      const client = new OmiseClient(config);

      await expect(client.getCharge('')).rejects.toThrow('chargeId is required');
    });

    it('throws on API error', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: vi.fn().mockResolvedValue('charge not found'),
      });

      const client = new OmiseClient(config);

      await expect(client.getCharge('chrg_test_bad')).rejects.toThrow(
        'Omise API error: 404 Not Found — charge not found',
      );
    });
  });

  describe('getPublicKey', () => {
    it('returns the public key', () => {
      const client = new OmiseClient(config);
      expect(client.getPublicKey()).toBe('pkey_test_1234567890');
    });
  });
});
