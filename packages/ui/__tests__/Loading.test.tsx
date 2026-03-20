import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading } from '../src/Loading';

describe('Loading', () => {
  it('renders with default message', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/กำลังโหลด/)).toBeInTheDocument();
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<Loading message="กรุณารอสักครู่..." />);

    expect(screen.getByText('กรุณารอสักครู่...')).toBeInTheDocument();
  });

  it('renders with multiline custom message', () => {
    render(<Loading message={'Line 1\nLine 2'} />);

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Line 2')).toBeInTheDocument();
  });

  it('injects spinner keyframes style into document.head (singleton)', () => {
    render(<Loading />);

    // The style is now injected into document.head, not inline in the component
    const headStyles = document.head.querySelectorAll('style');
    const spinnerStyle = Array.from(headStyles).find(
      (s) => s.textContent?.includes('sabai-spin'),
    );
    expect(spinnerStyle).toBeTruthy();
    expect(spinnerStyle?.textContent).toContain('rotate(360deg)');
  });

  it('does not inject duplicate style tags on multiple renders', () => {
    const { unmount } = render(<Loading />);
    unmount();

    render(<Loading />);
    render(<Loading />);

    const headStyles = document.head.querySelectorAll('style');
    const spinnerStyles = Array.from(headStyles).filter(
      (s) => s.textContent?.includes('sabai-spin'),
    );
    expect(spinnerStyles.length).toBe(1);
  });

  it('has correct aria attributes', () => {
    render(<Loading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Loading');
  });
});
