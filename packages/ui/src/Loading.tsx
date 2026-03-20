/**
 * Loading — Full-screen loading spinner for Thai regulatory apps.
 *
 * Displays an animated circular spinner with a customizable message.
 * Uses an injected `<style>` tag for the CSS `@keyframes` animation
 * since inline styles cannot express keyframes.
 *
 * @example
 * ```tsx
 * <Loading message="กำลังตรวจสอบ... / Verifying..." />
 * ```
 *
 * @module @sabai/ui/Loading
 */

import type { CSSProperties, ReactElement } from 'react';
import type { LoadingProps } from './types';

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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: 16,
  },
  spinner: {
    width: 48,
    height: 48,
    border: '4px solid #2a2a4a',
    borderTopColor: '#d4af37',
    borderRadius: '50%',
    animation: 'sabai-spin 0.8s linear infinite',
    marginBottom: 20,
  },
  message: {
    color: '#8892b0',
    fontSize: 16,
    margin: 0,
    textAlign: 'center' as const,
    lineHeight: 1.5,
  },
};

/** CSS keyframes for the spinner rotation — injected once via <style> */
const KEYFRAMES = `@keyframes sabai-spin { to { transform: rotate(360deg); } }`;

/**
 * Loading renders a full-screen overlay with an animated spinner and
 * an optional loading message.
 */
export function Loading({
  message = 'กำลังโหลด...\nLoading...',
}: LoadingProps): ReactElement {
  return (
    <div style={styles.overlay} role="status" aria-live="polite" aria-label="Loading">
      {/* Inject keyframes for the spinner animation */}
      <style>{KEYFRAMES}</style>

      <div style={styles.spinner} />
      <p style={styles.message}>
        {message.split('\n').map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}
