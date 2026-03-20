// @sabai/core — TypeScript type definitions

/** Configuration for initializing the LIFF SDK via Sabai. */
export interface SabaiConfig {
  /** The LIFF ID obtained from the LINE Developers Console. */
  liffId: string;
  /** Enable mock mode for local development without a real LINE account. */
  mockMode?: boolean;
  /** Application environment for conditional behavior. */
  appEnv?: 'development' | 'staging' | 'production';
}

/** Represents the current state of the LIFF SDK after initialization. */
export interface LiffState {
  /** Whether the LIFF SDK has been successfully initialized. */
  isReady: boolean;
  /** Whether the user is currently logged in via LINE. */
  isLoggedIn: boolean;
  /** Whether the app is running inside the LINE client (not external browser). */
  isInClient: boolean;
  /** The LINE user profile, if available. */
  profile: LiffProfile | null;
  /** Any error that occurred during initialization. */
  error: Error | null;
}

/** LINE user profile information returned by the LIFF SDK. */
export interface LiffProfile {
  /** Unique LINE user identifier. */
  userId: string;
  /** User's display name on LINE. */
  displayName: string;
  /** URL of the user's profile picture. */
  pictureUrl?: string;
  /** User's status message on LINE. */
  statusMessage?: string;
}

/** Module-level environment configuration for Sabai. */
export interface SabaiEnvConfig {
  /** The LIFF ID obtained from the LINE Developers Console. */
  liffId: string;
  /** Enable mock mode for local development. */
  mockMode: boolean;
  /** Application environment. */
  appEnv: 'development' | 'staging' | 'production';
}

/** Configuration for the i18n (internationalization) system. */
export interface I18nConfig {
  /** Default language code. If omitted, auto-detected from LINE/browser. */
  defaultLanguage?: string;
  /** Translation resources keyed by language code, then namespace, then key. */
  resources: Record<string, Record<string, Record<string, string>>>;
}

/** Parameters for sending a push message via the LINE Messaging API. */
export interface ServiceMessageParams {
  /** The recipient's LINE user ID. */
  to: string;
  /** Array of Flex Messages to send. */
  messages: FlexMessage[];
}

/** A LINE Flex Message object. */
export interface FlexMessage {
  /** Message type — always 'flex' for Flex Messages. */
  type: 'flex';
  /** Alt text shown in notification and chat list. */
  altText: string;
  /** The Flex Message container (bubble or carousel). */
  contents: Record<string, unknown>;
}

/** Data required to build an order confirmation Flex Message. */
export interface OrderConfirmation {
  /** Unique order identifier. */
  orderId: string;
  /** Line items in the order. */
  items: Array<{ name: string; quantity: number; price: number }>;
  /** Total order amount. */
  total: number;
  /** Currency symbol (defaults to '฿'). */
  currency?: string;
}
