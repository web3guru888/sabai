// @sabai/payments — Shared utility functions

/**
 * Calculate CRC16-CCITT checksum as required by the EMVCo QR specification.
 *
 * Uses the CRC-16/CCITT-FALSE variant:
 * - Polynomial: 0x1021
 * - Initial value: 0xFFFF
 * - No final XOR
 *
 * @param data - The string to compute the checksum over
 * @returns 4-character uppercase hex string (e.g. "A1B2")
 *
 * @example
 * ```ts
 * crc16('00020101021129370016A00000067701011101130066812345678530376458025.005802TH6304');
 * // => e.g. "8C55"
 * ```
 */
export function crc16(data: string): string {
  let crc = 0xffff;

  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Encode a TLV (Tag-Length-Value) field for EMVCo QR payloads.
 *
 * @param tag - 2-digit tag identifier (e.g. "00", "29")
 * @param value - The value string
 * @returns Encoded TLV string: `<tag><length><value>` where length is 2-digit zero-padded
 *
 * @example
 * ```ts
 * tlv('00', '01');  // => "000201"
 * tlv('58', 'TH');  // => "5802TH"
 * ```
 */
export function tlv(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${tag}${length}${value}`;
}

/**
 * Format a Thai phone number to the PromptPay international format.
 *
 * Converts "0812345678" → "0066812345678"
 * The leading zero is replaced with "0066" (Thailand country code prefix for PromptPay).
 *
 * @param phone - Thai-format phone number starting with "0" (e.g. "0812345678")
 * @returns PromptPay-formatted phone string (e.g. "0066812345678")
 * @throws Error if phone format is invalid
 */
export function formatPhoneForPromptPay(phone: string): string {
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length !== 10 || !digits.startsWith('0')) {
    throw new Error(
      `Invalid Thai phone number: "${phone}". Expected 10 digits starting with 0 (e.g. "0812345678").`,
    );
  }

  // Remove leading 0, prepend 0066
  return '0066' + digits.substring(1);
}

/**
 * Validate a Thai national ID number using the check digit algorithm.
 * Thai national IDs are 13 digits where digit 13 is a check digit
 * computed from digits 1-12 using a weighted sum modulo 11.
 * @param id - The national ID string
 * @returns true if valid
 */
export function isValidNationalId(id: string): boolean {
  const digits = id.replace(/\D/g, '');
  if (digits.length !== 13) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i], 10) * (13 - i);
  }
  const check = (11 - (sum % 11)) % 10;
  return check === parseInt(digits[12], 10);
}
