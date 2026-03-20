/**
 * ErrorBoundary — React error boundary for catching render errors.
 *
 * Wraps child components and catches JavaScript errors during rendering,
 * lifecycle methods, and constructors. Displays a fallback UI (defaults
 * to `ErrorDisplay`) and optionally invokes an error callback.
 *
 * Must be a class component per React's error boundary API.
 *
 * @example
 * ```tsx
 * <ErrorBoundary onError={(err) => logError(err)}>
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * @module @sabai/ui/ErrorBoundary
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import type { ErrorBoundaryProps, ErrorBoundaryState } from './types';

/**
 * ErrorBoundary catches JavaScript errors anywhere in its child component
 * tree, logs those errors, and displays a fallback UI instead of crashing
 * the whole component tree.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  /** Reset error state so children can be re-rendered */
  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  override render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      // Default fallback: ErrorDisplay with retry
      return (
        <ErrorDisplay
          title="เกิดข้อผิดพลาด / Something went wrong"
          message={
            this.state.error?.message ??
            'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ / An unexpected error occurred'
          }
          onRetry={this.handleRetry}
          retryLabel="ลองอีกครั้ง / Try Again"
        />
      );
    }

    return this.props.children;
  }
}
