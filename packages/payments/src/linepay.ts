// @sabai/payments — LINE Pay v3 API client
// Server-side only: uses Node.js crypto for HMAC-SHA256 signature generation.

import crypto from 'node:crypto';
import type {
  LinePayConfig,
  LinePayRequestBody,
  LinePayResponse,
  LinePayConfirmBody,
  LinePayConfirmResponse,
} from './types';

/** LINE Pay sandbox API base URL */
const SANDBOX_URL = 'https://sandbox-api-pay.line.me';

/** LINE Pay production API base URL */
const PRODUCTION_URL = 'https://api-pay.line.me';

/**
 * LINE Pay v3 API client.
 *
 * Implements the full payment lifecycle:
 * 1. **Reserve** — {@link requestPayment} creates a payment and returns redirect URLs
 * 2. **Confirm** — {@link confirmPayment} finalises the payment after user approval
 * 3. **Query** — {@link getPaymentDetails} checks transaction status
 *
 * All requests are signed with HMAC-SHA256 using the channel secret and a
 * unique nonce for replay protection, per the LINE Pay v3 specification.
 *
 * @example
 * ```ts
 * import { LinePayClient } from '@sabai/payments';
 *
 * const client = new LinePayClient({
 *   channelId: process.env.LINEPAY_CHANNEL_ID!,
 *   channelSecret: process.env.LINEPAY_CHANNEL_SECRET!,
 *   sandbox: true,
 * });
 *
 * const response = await client.requestPayment({
 *   amount: 350,
 *   currency: 'THB',
 *   orderId: 'order-001',
 *   packages: [{
 *     id: 'pkg-1',
 *     amount: 350,
 *     products: [{ name: 'Pad Thai', quantity: 1, price: 350 }],
 *   }],
 *   redirectUrls: {
 *     confirmUrl: 'https://example.com/pay/confirm',
 *     cancelUrl: 'https://example.com/pay/cancel',
 *   },
 * });
 *
 * // Redirect user to response.info.paymentUrl.web
 * ```
 */
export class LinePayClient {
  private channelId: string;
  private channelSecret: string;
  private baseUrl: string;

  constructor(config: LinePayConfig) {
    if (!config.channelId || !config.channelSecret) {
      throw new Error('LINE Pay channelId and channelSecret are required');
    }

    this.channelId = config.channelId;
    this.channelSecret = config.channelSecret;
    this.baseUrl = config.sandbox ? SANDBOX_URL : PRODUCTION_URL;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Reserve (request) a new LINE Pay payment.
   *
   * @param body - Payment request details including amount, packages, and redirect URLs
   * @returns LINE Pay response with payment URLs and transaction ID
   * @throws Error on HTTP or API-level failure
   *
   * @see https://pay.line.me/th/developers/apis/onlineApis
   */
  async requestPayment(body: LinePayRequestBody): Promise<LinePayResponse> {
    return this.post<LinePayResponse>('/v3/payments/request', body);
  }

  /**
   * Confirm a payment after the user has approved it via the LINE Pay UI.
   *
   * This must be called from the server when the user is redirected to `confirmUrl`.
   *
   * @param transactionId - Transaction ID from the reserve response
   * @param body - Confirmation body with amount and currency (must match the reserved values)
   * @returns Confirmation response with payment info
   * @throws Error on HTTP or API-level failure
   */
  async confirmPayment(
    transactionId: number,
    body: LinePayConfirmBody,
  ): Promise<LinePayConfirmResponse> {
    return this.post<LinePayConfirmResponse>(
      `/v3/payments/requests/${transactionId}/confirm`,
      body,
    );
  }

  /**
   * Check the status of a payment transaction.
   *
   * @param transactionId - Transaction ID to query
   * @returns Payment details response
   * @throws Error on HTTP or API-level failure
   */
  async getPaymentDetails(transactionId: number): Promise<LinePayResponse> {
    return this.get<LinePayResponse>(
      `/v3/payments/requests/${transactionId}/check`,
    );
  }

  // ---------------------------------------------------------------------------
  // Request signing (HMAC-SHA256)
  // ---------------------------------------------------------------------------

  /**
   * Generate HMAC-SHA256 signature for LINE Pay v3 API authentication.
   *
   * Signature = Base64(HMAC-SHA256(channelSecret, channelSecret + URI + requestBody + nonce))
   *
   * @param uri - API endpoint path (e.g. "/v3/payments/request")
   * @param body - Stringified request body (empty string for GET requests)
   * @param nonce - Unique nonce for replay protection
   * @returns Base64-encoded HMAC-SHA256 signature
   */
  private generateSignature(uri: string, body: string, nonce: string): string {
    const message = this.channelSecret + uri + body + nonce;
    return crypto
      .createHmac('sha256', this.channelSecret)
      .update(message)
      .digest('base64');
  }

  /**
   * Generate a cryptographically secure random nonce (UUID v4).
   *
   * @returns UUID v4 string
   */
  private generateNonce(): string {
    return crypto.randomUUID();
  }

  // ---------------------------------------------------------------------------
  // HTTP helpers
  // ---------------------------------------------------------------------------

  /**
   * Make an authenticated POST request to the LINE Pay API.
   *
   * @param uri - API endpoint path
   * @param body - Request body (will be JSON-serialised)
   * @returns Parsed JSON response
   */
  private async post<T>(uri: string, body: object): Promise<T> {
    const nonce = this.generateNonce();
    const bodyStr = JSON.stringify(body);
    const signature = this.generateSignature(uri, bodyStr, nonce);

    const response = await fetch(`${this.baseUrl}${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-LINE-ChannelId': this.channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature,
      },
      body: bodyStr,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `LINE Pay API error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ''}`,
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Make an authenticated GET request to the LINE Pay API.
   *
   * @param uri - API endpoint path
   * @returns Parsed JSON response
   */
  private async get<T>(uri: string): Promise<T> {
    const nonce = this.generateNonce();
    const signature = this.generateSignature(uri, '', nonce);

    const response = await fetch(`${this.baseUrl}${uri}`, {
      method: 'GET',
      headers: {
        'X-LINE-ChannelId': this.channelId,
        'X-LINE-Authorization-Nonce': nonce,
        'X-LINE-Authorization': signature,
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(
        `LINE Pay API error: ${response.status} ${response.statusText}${text ? ` — ${text}` : ''}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
