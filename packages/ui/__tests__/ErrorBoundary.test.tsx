import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../src/ErrorBoundary';

// Suppress console.error from React error boundary logging
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// A component that throws
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <div>Child content rendered</div>;
}

describe('ErrorBoundary', () => {
  it('renders children normally when no error', () => {
    render(
      <ErrorBoundary>
        <div>Hello World</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('catches errors and shows default fallback (ErrorDisplay)', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Should show ErrorDisplay with the error message
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test render error')).toBeInTheDocument();
    expect(screen.getByText('เกิดข้อผิดพลาด / Something went wrong')).toBeInTheDocument();

    // Should show retry button
    expect(screen.getByRole('button', { name: /ลองอีกครั้ง/ })).toBeInTheDocument();
  });

  it('shows custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom error fallback</div>}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Custom error fallback')).toBeInTheDocument();
  });

  it('calls onError callback when error is caught', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test render error' }),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );
  });

  it('renders null fallback when fallback is explicitly null', () => {
    const { container } = render(
      <ErrorBoundary fallback={null}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    // Nothing should be rendered
    expect(container.innerHTML).toBe('');
  });

  it('does not call onError when no error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(onError).not.toHaveBeenCalled();
    expect(screen.getByText('Child content rendered')).toBeInTheDocument();
  });
});
