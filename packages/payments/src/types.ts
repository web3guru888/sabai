// @sabai/payments — TypeScript type definitions
// Covers LINE Pay v3, PromptPay QR (EMVCo), and Omise payment integrations

// ---------------------------------------------------------------------------
// LINE Pay v3 API types
// ---------------------------------------------------------------------------

/** Configuration for the LINE Pay v3 client */
export interface LinePayConfig {
  /** LINE Pay channel ID */
  channelId: string;
  /** LINE Pay channel secret */
  channelSecret: string;
  /** Use sandbox endpoint instead of production (default: false) */
  sandbox?: boolean;
}

/** A single product within a LINE Pay package */
export interface LinePayProduct {
  /** Product name */
  name: string;
  /** Quantity */
  quantity: number;
  /** Price per unit */
  price: number;
  /** Optional product image URL */
  imageUrl?: string;
}

/** A package grouping for a LINE Pay request */
export interface LinePayPackage {
  /** Package ID (merchant-defined) */
  id: string;
  /** Total amount for this package */
  amount: number;
  /** Optional package name */
  name?: string;
  /** Products in this package */
  products: LinePayProduct[];
}

/** Body for a LINE Pay payment request (Reserve API) */
export interface LinePayRequestBody {
  /** Total payment amount */
  amount: number;
  /** ISO 4217 currency code (default: "THB") */
  currency: string;
  /** Merchant-generated order ID */
  orderId: string;
  /** Product packages included in this payment */
  packages: LinePayPackage[];
  /** Redirect URLs after user action */
  redirectUrls: {
    /** URL to redirect to after user confirms payment */
    confirmUrl: string;
    /** URL to redirect to if user cancels payment */
    cancelUrl: string;
  };
}

/** Response from the LINE Pay Reserve (request) API */
export interface LinePayResponse {
  /** "0000" on success */
  returnCode: string;
  /** Human-readable result message */
  returnMessage: string;
  /** Present on success — contains payment URLs and transaction metadata */
  info?: {
    /** URLs the user should be directed to for payment */
    paymentUrl: {
      /** Web browser payment URL */
      web: string;
      /** LINE app deep-link payment URL */
      app: string;
    };
    /** LINE Pay transaction ID */
    transactionId: number;
    /** Access token for payment status queries */
    paymentAccessToken: string;
  };
}

/** Body for confirming a LINE Pay transaction */
export interface LinePayConfirmBody {
  /** Amount to confirm (must match the reserved amount) */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
}

/** Response from the LINE Pay Confirm API */
export interface LinePayConfirmResponse {
  /** "0000" on success */
  returnCode: string;
  /** Human-readable result message */
  returnMessage: string;
  /** Present on success — contains confirmed transaction details */
  info?: {
    /** LINE Pay transaction ID */
    transactionId: number;
    /** Merchant order ID echoed back */
    orderId: string;
    /** Breakdown of payment methods and amounts */
    payInfo: Array<{
      /** Payment method (e.g. "BALANCE", "DISCOUNT") */
      method: string;
      /** Amount paid via this method */
      amount: number;
    }>;
  };
}

// ---------------------------------------------------------------------------
// PromptPay QR types
// ---------------------------------------------------------------------------

/** Configuration for generating a PromptPay QR code */
export interface PromptPayConfig {
  /**
   * PromptPay target identifier:
   * - Mobile number in Thai format (e.g. "0812345678")
   * - National ID (13 digits, e.g. "1234567890123")
   */
  target: string;
  /** Amount in THB. Omit for a static (reusable, any-amount) QR code */
  amount?: number;
}

/** Result of PromptPay QR generation */
export interface PromptPayQRResult {
  /** Raw EMVCo-compliant payload string (TLV-encoded) */
  payload: string;
  /** Data URL of the QR code image (PNG, base64-encoded) */
  qrDataUrl: string;
}

// ---------------------------------------------------------------------------
// Omise types
// ---------------------------------------------------------------------------

/** Configuration for the Omise payment client */
export interface OmiseConfig {
  /** Omise public key (pkey_...) — safe for client-side use */
  publicKey: string;
  /** Omise secret key (skey_...) — server-side only, never expose to clients */
  secretKey?: string;
}

/** Request body for creating an Omise charge */
export interface OmiseChargeRequest {
  /** Amount in smallest currency unit (e.g. satang for THB: 10000 = 100 THB) */
  amount: number;
  /** ISO 4217 currency code (e.g. "thb") */
  currency: string;
  /** Token ID from Omise.js card tokenisation */
  card?: string;
  /** Source ID for alternative payment methods (e.g. PromptPay via Omise) */
  source?: string;
  /** Optional charge description */
  description?: string;
  /** Arbitrary key-value metadata attached to the charge */
  metadata?: Record<string, unknown>;
}

/** Omise charge object returned by the API */
export interface OmiseCharge {
  /** Charge ID (chrg_...) */
  id: string;
  /** Amount in smallest currency unit */
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  /** Charge status: "pending", "successful", "failed", "expired", "reversed" */
  status: string;
  /** Whether the charge has been successfully paid */
  paid: boolean;
  /** Transaction ID (if settled) */
  transaction?: string;
  /** Machine-readable failure code (if failed) */
  failureCode?: string;
  /** Human-readable failure message (if failed) */
  failureMessage?: string;
}
