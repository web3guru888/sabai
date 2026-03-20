/**
 * ErrorDisplay — Full-screen error display with optional retry action.
 *
 * Provides a user-friendly error screen with bilingual Thai/English
 * messaging and an optional retry button.
 *
 * @example
 * ```tsx
 * <ErrorDisplay
 *   message="ไม่สามารถเชื่อมต่อได้ / Unable to connect"
 *   onRetry={() => window.location.reload()}
 * />
 * ```
 *
 * @module @sabai/ui/ErrorDisplay
 */

import type { CSSProperties, ReactElement } from 'react';
import type { ErrorDisplayProps } from './types';

/* ──────────────────────── Inline Styles ──────────────────────── */

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#1a1a2e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: 16,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 32,
    maxWidth: 420,
    width: '100%',
    textAlign: 'center' as const,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    lineHeight: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 700,
    margin: '0 0 12px 0',
    lineHeight: 1.3,
  },
  message: {
    color: '#8892b0',
    fontSize: 14,
    margin: '0 0 24px 0',
    lineHeight: 1.6,
    wordBreak: 'break-word' as const,
  },
  button: {
    display: 'inline-block',
    padding: '12px 32px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#d4af37',
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
};

/**
 * ErrorDisplay renders a full-screen error overlay with an icon, title,
 * message, and an optional retry button.
 */
export function ErrorDisplay({
  title = 'เกิดข้อผิดพลาด / Something went wrong',
  message,
  onRetry,
  retryLabel = 'ลองอีกครั้ง / Try Again',
}: ErrorDisplayProps): ReactElement {
  return (
    <div style={styles.overlay} role="alert" aria-live="assertive">
      <div style={styles.card}>
        {/* Error icon */}
        <div style={styles.icon} aria-hidden="true">
          ⚠️
        </div>

        {/* Title */}
        <h1 style={styles.title}>{title}</h1>

        {/* Message */}
        <p style={styles.message}>{message}</p>

        {/* Retry button */}
        {onRetry && (
          <button type="button" style={styles.button} onClick={onRetry}>
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}
