import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../src/ErrorDisplay';

describe('ErrorDisplay', () => {
  it('renders error message', () => {
    render(<ErrorDisplay message="Something went terribly wrong" />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went terribly wrong')).toBeInTheDocument();
  });

  it('renders default title', () => {
    render(<ErrorDisplay message="Error occurred" />);

    expect(screen.getByText('เกิดข้อผิดพลาด / Something went wrong')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<ErrorDisplay title="Custom Error Title" message="Error occurred" />);

    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /ลองอีกครั้ง/ });
    expect(retryButton).toBeInTheDocument();
  });

  it('hides retry button when onRetry is not provided', () => {
    render(<ErrorDisplay message="Error" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay message="Error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /ลองอีกครั้ง/ });
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('supports custom retry label', () => {
    const onRetry = vi.fn();
    render(<ErrorDisplay message="Error" onRetry={onRetry} retryLabel="Retry Now" />);

    expect(screen.getByRole('button', { name: 'Retry Now' })).toBeInTheDocument();
  });

  it('shows error icon', () => {
    render(<ErrorDisplay message="Error" />);

    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('has correct aria attributes', () => {
    render(<ErrorDisplay message="Error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
