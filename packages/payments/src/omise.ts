// @sabai/payments — Omise payment integration
// Server-side only: requires secret key for charge operations.
// Ready for full implementation — core CRUD operations scaffolded.

import type { OmiseConfig, OmiseChargeRequest, OmiseCharge } from './types';

/** Omise API base URL */
const OMISE_API_URL = 'https://api.omise.co';

/**
 * Omise payment client for creating and managing charges.
 *
 * Supports credit/debit cards and alternative payment methods available
 * in Thailand (TrueMoney Wallet, internet banking, PromptPay via Omise, etc.).
 *
 * **Important:** Charge operations require the secret key and must only
 * run server-side. Never expose your secret key to client code.
 *
 * @example
 * ```ts
 * import { OmiseClient } from '@sabai/payments';
 *
 * const omise = new OmiseClient({
 *   publicKey: process.env.OMISE_PUBLIC_KEY!,
 *   secretKey: process.env.OMISE_SECRET_KEY!,
 * });
 *
 * const charge = await omise.createCharge({
 *   amount: 10000, // 100.00 THB (in satang)
 *   currency: 'thb',
 *   card: 'tokn_test_xxxxxxxxxxxx',
 *   description: 'Order #1234',
 * });
 *
 * console.log(charge.status); // "successful"
 * ```
 */
export class OmiseClient {
  private publicKey: string;
  private secretKey: string | undefined;

  constructor(config: OmiseConfig) {
    if (!config.publicKey) {
      throw new Error('Omise publicKey is required');
    }

    this.publicKey = config.publicKey;
    this.secretKey = config.secretKey;
  }

  /**
   * Get the public key (safe for client-side use, e.g. Omise.js tokenisation).
   *
   * @returns The Omise public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Create a new charge.
   *
   * **Server-side only** — requires the secret key.
   *
   * @param request - Charge details including amount, currency, and payment source
   * @returns The created charge object
   * @throws Error if secret key is not configured or API request fails
   *
   * @see https://docs.opn.ooo/charges-api
   */
  async createCharge(request: OmiseChargeRequest): Promise<OmiseCharge> {
    this.requireSecretKey('createCharge');

    const response = await fetch(`${OMISE_API_URL}/charges`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.encodeAuth()}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Omise API error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ''}`,
      );
    }

    return response.json() as Promise<OmiseCharge>;
  }

  /**
   * Retrieve an existing charge by ID.
   *
   * **Server-side only** — requires the secret key.
   *
   * @param chargeId - Charge ID (e.g. "chrg_test_xxxxxxxxxxxx")
   * @returns The charge object
   * @throws Error if secret key is not configured or API request fails
   */
  async getCharge(chargeId: string): Promise<OmiseCharge> {
    this.requireSecretKey('getCharge');

    if (!chargeId) {
      throw new Error('chargeId is required');
    }

    const response = await fetch(`${OMISE_API_URL}/charges/${chargeId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${this.encodeAuth()}`,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `Omise API error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ''}`,
      );
    }

    return response.json() as Promise<OmiseCharge>;
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /**
   * Encode the secret key for HTTP Basic Auth.
   * Omise uses the secret key as the username with an empty password.
   *
   * @returns Base64-encoded "secretKey:" string
   */
  private encodeAuth(): string {
    // btoa is available in both Node 16+ and browsers
    return btoa(this.secretKey + ':');
  }

  /**
   * Guard that throws if the secret key is not configured.
   *
   * @param operation - Name of the operation (for error message)
   */
  private requireSecretKey(operation: string): void {
    if (!this.secretKey) {
      throw new Error(
        `Omise secret key is required for ${operation}. ` +
          'This operation must be performed server-side only.',
      );
    }
  }
}
