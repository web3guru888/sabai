// @sabai/payments — Payment integrations for Thailand
// Supports LINE Pay v3, PromptPay QR (EMVCo), and Omise.

// ---------------------------------------------------------------------------
// LINE Pay v3 — Server-side payment client
// ---------------------------------------------------------------------------
export { LinePayClient } from './linepay';

// ---------------------------------------------------------------------------
// PromptPay QR — Client-safe EMVCo QR code generation
// ---------------------------------------------------------------------------
export { generatePromptPayPayload, generatePromptPayQR } from './promptpay';

// ---------------------------------------------------------------------------
// Omise — Payment gateway client (server-side for charges)
// ---------------------------------------------------------------------------
export { OmiseClient } from './omise';

// ---------------------------------------------------------------------------
// Utilities — Shared helpers (CRC16, TLV encoding, phone formatting)
// ---------------------------------------------------------------------------
export { crc16, tlv, formatPhoneForPromptPay, isValidNationalId } from './utils';

// ---------------------------------------------------------------------------
// Types — Full type re-exports for consumers
// ---------------------------------------------------------------------------
export type {
  // LINE Pay
  LinePayConfig,
  LinePayRequestBody,
  LinePayPackage,
  LinePayProduct,
  LinePayResponse,
  LinePayConfirmBody,
  LinePayConfirmResponse,
  // PromptPay
  PromptPayConfig,
  PromptPayQRResult,
  // Omise
  OmiseConfig,
  OmiseChargeRequest,
  OmiseCharge,
} from './types';
