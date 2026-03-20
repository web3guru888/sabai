// @sabai/core — React hooks for LIFF integration

import { useState, useEffect, useCallback } from 'react';
import { initLiff } from './liff';
import type { SabaiConfig, LiffState } from './types';

/**
 * React hook that initializes the LIFF SDK and provides reactive state.
 *
 * Handles deduplication internally — safe to use with React StrictMode.
 * The hook returns the current LIFF state plus `login` and `logout` helpers.
 *
 * @param config - Sabai/LIFF configuration including the LIFF ID.
 * @returns The current {@link LiffState} plus login/logout action methods.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { isReady, isLoggedIn, profile, login, logout } = useLiff({
 *     liffId: '1234567890-abcdefgh',
 *   });
 *
 *   if (!isReady) return <div>Loading...</div>;
 *   if (!isLoggedIn) return <button onClick={() => login()}>Login</button>;
 *
 *   return <div>Hello, {profile?.displayName}!</div>;
 * }
 * ```
 */
export function useLiff(
  config: SabaiConfig,
): LiffState & {
  login: (redirectUri?: string) => Promise<void>;
  logout: () => Promise<void>;
} {
  const [state, setState] = useState<LiffState>({
    isReady: false,
    isLoggedIn: false,
    isInClient: false,
    profile: null,
    error: null,
  });

  useEffect(() => {
    initLiff(config).then(setState);
    // Re-initialize only when the LIFF ID changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.liffId]);

  const login = useCallback(async (redirectUri?: string) => {
    const liff = (await import('@line/liff')).default;
    liff.login({ redirectUri });
  }, []);

  const logout = useCallback(async () => {
    const liff = (await import('@line/liff')).default;
    liff.logout();
    window.location.reload();
  }, []);

  return {
    ...state,
    login,
    logout,
  };
}
