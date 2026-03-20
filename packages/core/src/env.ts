// @sabai/core — Module-level environment configuration singleton
// Solves the tsup/Vite import.meta.env gap by providing a runtime config store.

import type { SabaiEnvConfig } from './types';

/** Module-level singleton holding the current Sabai configuration. */
let config: SabaiEnvConfig | null = null;

/**
 * Set the global Sabai environment configuration.
 *
 * Must be called once at application startup before using any other Sabai APIs.
 *
 * @param envConfig - The environment configuration to store.
 *
 * @example
 * ```ts
 * configureSabai({
 *   liffId: '1234567890-abcdefgh',
 *   mockMode: import.meta.env.DEV,
 *   appEnv: 'production',
 * });
 * ```
 */
export function configureSabai(envConfig: SabaiEnvConfig): void {
  config = { ...envConfig };
}

/**
 * Retrieve the current Sabai environment configuration.
 *
 * @returns The stored configuration object.
 * @throws {Error} If {@link configureSabai} has not been called yet.
 */
export function getSabaiConfig(): SabaiEnvConfig {
  if (!config) {
    throw new Error('Sabai not configured. Call configureSabai() first.');
  }
  return { ...config };
}
