/**
 * @sabai/ui — React components for Thai regulatory compliance.
 *
 * Zero-dependency component library providing age verification (Thai alcohol law),
 * PDPA consent management, loading states, and error handling — all with inline
 * styles and a premium dark theme.
 *
 * @packageDocumentation
 */

// ─── Components ──────────────────────────────────────────────
export { AgeVerification } from './AgeVerification';
export { PdpaConsent } from './PdpaConsent';
export { Loading } from './Loading';
export { ErrorDisplay } from './ErrorDisplay';
export { ErrorBoundary } from './ErrorBoundary';

// ─── Types ───────────────────────────────────────────────────
export type {
  AgeVerificationProps,
  PdpaConsentProps,
  PdpaConsentItem,
  PdpaConsentRecord,
  LoadingProps,
  ErrorDisplayProps,
  ErrorBoundaryProps,
} from './types';
