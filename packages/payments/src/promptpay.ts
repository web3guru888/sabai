// @sabai/payments — PromptPay QR code generator
// Client-safe: runs in both Node.js and browser environments.
// Generates EMVCo-compliant TLV payloads for Thai PromptPay transfers.

import QRCode from 'qrcode';
import type { PromptPayConfig, PromptPayQRResult } from './types';
import { crc16, tlv, formatPhoneForPromptPay, isValidNationalId } from './utils';

/** PromptPay AID (Application Identifier) registered with EMVCo */
const PROMPTPAY_AID = 'A000000677010111';

/**
 * Generate an EMVCo-compliant PromptPay payload string.
 *
 * The payload follows the EMVCo Merchant-Presented QR specification:
 *
 * | Tag | Description                 | Value                              |
 * |-----|-----------------------------|------------------------------------|
 * | 00  | Payload Format Indicator    | "01"                               |
 * | 01  | Point of Initiation Method  | "11" (static) or "12" (dynamic)    |
 * | 29  | Merchant Account (PromptPay)| Sub-TLV with AID + target ID       |
 * | 53  | Transaction Currency        | "764" (THB per ISO 4217)           |
 * | 54  | Transaction Amount          | Amount string (if dynamic)         |
 * | 58  | Country Code                | "TH"                               |
 * | 63  | CRC16 Checksum              | Computed over entire payload        |
 *
 * @param config - PromptPay target (phone or national ID) and optional amount
 * @returns EMVCo TLV payload string with CRC16 checksum
 * @throws Error if the target is not a valid phone number or national ID
 *
 * @example
 * ```ts
 * // Static QR (any amount)
 * const payload = generatePromptPayPayload({ target: '0812345678' });
 *
 * // Dynamic QR (fixed amount)
 * const payload = generatePromptPayPayload({ target: '0812345678', amount: 150.50 });
 * ```
 */
export function generatePromptPayPayload(config: PromptPayConfig): string {
  const { target, amount } = config;
  const sanitisedTarget = target.replace(/\D/g, '');

  // Determine target type and format the identifier
  let targetTag: string;
  let formattedTarget: string;

  if (sanitisedTarget.length === 13 && isValidNationalId(sanitisedTarget)) {
    // National ID: sub-tag 02
    targetTag = '02';
    formattedTarget = sanitisedTarget;
  } else if (sanitisedTarget.length === 10 && sanitisedTarget.startsWith('0')) {
    // Thai phone number: sub-tag 01
    targetTag = '01';
    formattedTarget = formatPhoneForPromptPay(sanitisedTarget);
  } else {
    throw new Error(
      `Invalid PromptPay target: "${target}". ` +
        'Must be a 10-digit Thai phone number (e.g. "0812345678") or ' +
        'a 13-digit national ID (e.g. "1234567890123").',
    );
  }

  // Point of initiation: "11" = static (reusable), "12" = dynamic (one-time with amount)
  const pointOfInitiation = amount != null ? '12' : '11';

  // Build merchant account info (tag 29) sub-fields
  const merchantAccountSub =
    tlv('00', PROMPTPAY_AID) + tlv(targetTag, formattedTarget);

  // Assemble the payload (without CRC)
  let payload = '';
  payload += tlv('00', '01'); // Payload Format Indicator
  payload += tlv('01', pointOfInitiation); // Point of Initiation Method
  payload += tlv('29', merchantAccountSub); // Merchant Account — PromptPay
  payload += tlv('53', '764'); // Transaction Currency: THB
  if (amount != null) {
    payload += tlv('54', amount.toFixed(2)); // Transaction Amount
  }
  payload += tlv('58', 'TH'); // Country Code

  // Append CRC placeholder (tag 63, length 04) then compute checksum
  payload += '6304';
  const checksum = crc16(payload);
  payload += checksum;

  return payload;
}

/**
 * Generate a PromptPay QR code image as a data URL.
 *
 * Combines EMVCo payload generation with QR code rendering.
 * The resulting QR code is compatible with all Thai banking apps.
 *
 * @param config - PromptPay target and optional amount
 * @param options - Optional QR code rendering options
 * @param options.width - QR image width in pixels (default: 300)
 * @param options.margin - Quiet zone margin in modules (default: 2)
 * @returns Object with the raw payload string and a PNG data URL
 *
 * @example
 * ```ts
 * import { generatePromptPayQR } from '@sabai/payments';
 *
 * const { payload, qrDataUrl } = await generatePromptPayQR({
 *   target: '0812345678',
 *   amount: 99.00,
 * });
 *
 * // In HTML: <img src={qrDataUrl} alt="PromptPay QR" />
 * ```
 */
export async function generatePromptPayQR(
  config: PromptPayConfig,
  options?: { width?: number; margin?: number },
): Promise<PromptPayQRResult> {
  const payload = generatePromptPayPayload(config);

  const qrDataUrl = await QRCode.toDataURL(payload, {
    width: options?.width ?? 300,
    margin: options?.margin ?? 2,
    errorCorrectionLevel: 'M',
  });

  return { payload, qrDataUrl };
}
