// @sabai/core — LIFF SDK initialization with retry logic and deduplication

import type { SabaiConfig, LiffState, LiffProfile } from './types';

/**
 * Module-level promise cache for deduplication.
 * Prevents multiple parallel inits (safe for React StrictMode double-effects).
 */
let initPromise: Promise<LiffState> | null = null;

/** LIFF error codes that should not be retried. */
const NON_RETRYABLE_ERRORS = ['INVALID_ARGUMENT', 'UNAUTHORIZED'];

/** Maximum number of initialization attempts. */
const MAX_RETRIES = 3;

/**
 * Initialize the LIFF SDK with automatic retry and deduplication.
 *
 * Subsequent calls return the same cached promise, making this safe to call
 * from React effects that may fire multiple times (StrictMode).
 *
 * @param config - Sabai/LIFF configuration including the LIFF ID.
 * @returns A promise resolving to the current {@link LiffState}.
 *
 * @example
 * ```ts
 * const state = await initLiff({ liffId: '1234567890-abcdefgh' });
 * if (state.isReady && state.isLoggedIn) {
 *   console.log(`Hello, ${state.profile?.displayName}`);
 * }
 * ```
 */
export async function initLiff(config: SabaiConfig): Promise<LiffState> {
  if (initPromise) return initPromise;
  initPromise = doInit(config);
  return initPromise;
}

/**
 * Internal initialization logic with exponential-backoff retry.
 */
async function doInit(config: SabaiConfig): Promise<LiffState> {
  const liff = (await import('@line/liff')).default;

  if (config.mockMode) {
    const { default: LiffMockPlugin } = await import('@line/liff-mock');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    liff.use(new LiffMockPlugin() as any);
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await liff.init({ liffId: config.liffId });

      const isLoggedIn = liff.isLoggedIn();
      const isInClient = liff.isInClient();
      let profile: LiffProfile | null = null;

      if (isLoggedIn) {
        try {
          const p = await liff.getProfile();
          profile = {
            userId: p.userId,
            displayName: p.displayName,
            pictureUrl: p.pictureUrl,
            statusMessage: p.statusMessage,
          };
        } catch {
          // Profile fetch failed — continue without profile data
        }
      }

      return {
        isReady: true,
        isLoggedIn,
        isInClient,
        profile,
        error: null,
      };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Check for non-retryable errors
      const errorCode = (err as { code?: string })?.code;
      if (errorCode && NON_RETRYABLE_ERRORS.includes(errorCode)) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }

  return {
    isReady: false,
    isLoggedIn: false,
    isInClient: false,
    profile: null,
    error: lastError,
  };
}

/**
 * Get the current LIFF access token.
 *
 * Returns `null` if LIFF has not been initialized or no token is available.
 *
 * @returns The access token string, or `null`.
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const liff = (await import('@line/liff')).default;
    return liff.getAccessToken();
  } catch {
    return null;
  }
}

/**
 * Get the current LIFF ID token (OpenID Connect).
 *
 * Returns `null` if LIFF has not been initialized or no token is available.
 *
 * @returns The ID token string, or `null`.
 */
export async function getIdToken(): Promise<string | null> {
  try {
    const liff = (await import('@line/liff')).default;
    return liff.getIDToken();
  } catch {
    return null;
  }
}

/**
 * Trigger the LINE login flow.
 *
 * @param redirectUri - Optional URI to redirect to after login completes.
 */
export async function login(redirectUri?: string): Promise<void> {
  const liff = (await import('@line/liff')).default;
  liff.login({ redirectUri });
}

/**
 * Log out the current user and reload the page.
 */
export async function logout(): Promise<void> {
  const liff = (await import('@line/liff')).default;
  liff.logout();
  window.location.reload();
}

/**
 * Check whether the app is running inside the LINE client.
 *
 * @returns `true` if running in the LINE app, `false` if in an external browser.
 */
export async function isInClient(): Promise<boolean> {
  const liff = (await import('@line/liff')).default;
  return liff.isInClient();
}
