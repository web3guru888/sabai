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

  it('shows spinner animation (style tag with keyframes)', () => {
    const { container } = render(<Loading />);

    // Check that the keyframes style is injected
    const styleTag = container.querySelector('style');
    expect(styleTag).toBeTruthy();
    expect(styleTag?.textContent).toContain('sabai-spin');
    expect(styleTag?.textContent).toContain('rotate(360deg)');
  });

  it('has correct aria attributes', () => {
    render(<Loading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-label', 'Loading');
  });
});
