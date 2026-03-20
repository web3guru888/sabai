/**
 * Loading — Full-screen loading spinner for Thai regulatory apps.
 *
 * Displays an animated circular spinner with a customizable message.
 * Uses a module-level singleton to inject the CSS `@keyframes` animation
 * exactly once into the document head, regardless of how many `Loading`
 * instances exist or how often they re-render.
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

/* ──────────────────────── Singleton Style Injection ──────────────────────── */

/** Module-level flag ensuring the keyframe style is injected at most once */
let styleInjected = false;

/**
 * Injects the spinner `@keyframes` animation into `document.head` exactly once.
 * Safe in SSR environments — silently skips when `document` is unavailable.
 */
function injectSpinnerStyle(): void {
  if (styleInjected || typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes sabai-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  styleInjected = true;
}

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

/**
 * Loading renders a full-screen overlay with an animated spinner and
 * an optional loading message.
 *
 * The spinner keyframe animation is injected into the document head
 * exactly once (singleton pattern), preventing style tag accumulation
 * across multiple renders or instances.
 */
export function Loading({
  message = 'กำลังโหลด...\nLoading...',
}: LoadingProps): ReactElement {
  // Inject the keyframe style exactly once across all instances/renders
  injectSpinnerStyle();

  return (
    <div style={styles.overlay} role="status" aria-live="polite" aria-label="Loading">
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
