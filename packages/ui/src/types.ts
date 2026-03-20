/**
 * @sabai/ui — TypeScript types for Thai regulatory compliance components
 * @module @sabai/ui/types
 */

import type { ReactNode, ErrorInfo } from 'react';

/**
 * Props for the AgeVerification component.
 *
 * Renders a full-screen age gate overlay with date-of-birth selection.
 * Under Thai law, the minimum age for purchasing alcohol is 20.
 */
export interface AgeVerificationProps {
  /** Minimum age required (default: 20 for Thai alcohol law) */
  minimumAge?: number;
  /** Callback when age verification passes */
  onVerified: () => void;
  /** Title text (default: "กรุณายืนยันอายุ / Please verify your age") */
  title?: string;
  /** Subtitle text (default: "คุณต้องมีอายุ {minimumAge} ปีขึ้นไป / You must be {minimumAge} years or older") */
  subtitle?: string;
}

/**
 * A single consent item displayed in the PDPA consent form.
 */
export interface PdpaConsentItem {
  /** Unique identifier for this consent item */
  id: string;
  /** Display label (recommended bilingual Thai/English) */
  label: string;
  /** Optional longer description */
  description?: string;
  /** Whether this consent item is required to proceed */
  required: boolean;
}

/**
 * The consent record produced when the user accepts PDPA consent.
 * This record is suitable for audit logging.
 */
export interface PdpaConsentRecord {
  /** Version string for the consent form (for audit trail) */
  version: string;
  /** ISO 8601 timestamp of when consent was given */
  timestamp: string;
  /** Map of consent item IDs to their accepted/rejected state */
  consents: Record<string, boolean>;
}

/**
 * Props for the PdpaConsent component.
 *
 * Renders a bottom-sheet style overlay for collecting PDPA consent.
 * Per Thai PDPA regulations, no checkboxes are pre-checked.
 */
export interface PdpaConsentProps {
  /** Consent items to display. Uses sensible Thai defaults if omitted. */
  items?: PdpaConsentItem[];
  /** Callback when consent is accepted with the full consent record */
  onAccept: (consents: PdpaConsentRecord) => void;
  /** Title (default: "นโยบายความเป็นส่วนตัว / Privacy Policy") */
  title?: string;
  /** Version string for audit trail (default: "1.0") */
  version?: string;
}

/**
 * Props for the Loading component.
 *
 * Renders a full-screen loading overlay with animated spinner.
 */
export interface LoadingProps {
  /** Loading message (default: "กำลังโหลด... / Loading...") */
  message?: string;
}

/**
 * Props for the ErrorDisplay component.
 *
 * Renders a full-screen error display with optional retry action.
 */
export interface ErrorDisplayProps {
  /** Error title (default: "เกิดข้อผิดพลาด / Something went wrong") */
  title?: string;
  /** Error message to display */
  message: string;
  /** Optional retry callback — shows a retry button when provided */
  onRetry?: () => void;
  /** Retry button text (default: "ลองอีกครั้ง / Try Again") */
  retryLabel?: string;
}

/**
 * Props for the ErrorBoundary component.
 *
 * Wraps children in a React error boundary that catches render errors
 * and displays a fallback UI.
 */
export interface ErrorBoundaryProps {
  /** Custom fallback UI to show on error. Defaults to ErrorDisplay. */
  fallback?: ReactNode;
  /** Error callback invoked when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Children to render */
  children: ReactNode;
}

/**
 * Internal state for the ErrorBoundary class component.
 * @internal
 */
export interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The caught error, if any */
  error: Error | null;
}
