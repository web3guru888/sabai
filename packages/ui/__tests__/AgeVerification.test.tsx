import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgeVerification } from '../src/AgeVerification';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AgeVerification', () => {
  const onVerified = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders with correct title and subtitle', () => {
    render(<AgeVerification onVerified={onVerified} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/กรุณายืนยันอายุ/)).toBeInTheDocument();
    expect(screen.getByText(/Please verify your age/)).toBeInTheDocument();
    expect(screen.getByText(/คุณต้องมีอายุ 20 ปีขึ้นไป/)).toBeInTheDocument();
  });

  it('shows day, month, and year dropdowns', () => {
    render(<AgeVerification onVerified={onVerified} />);

    expect(screen.getByLabelText('Day')).toBeInTheDocument();
    expect(screen.getByLabelText('Month')).toBeInTheDocument();
    expect(screen.getByLabelText('Year')).toBeInTheDocument();
  });

  it('confirm button is disabled until all fields are selected', () => {
    render(<AgeVerification onVerified={onVerified} />);

    const button = screen.getByRole('button', { name: /ยืนยัน/ });
    expect(button).toBeDisabled();

    // Select only day
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '15' } });
    expect(button).toBeDisabled();

    // Select month too
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '6' } });
    expect(button).toBeDisabled();

    // Select year — now all are selected
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1990' } });
    expect(button).not.toBeDisabled();
  });

  it('accepts user who is old enough (age >= 20)', () => {
    render(<AgeVerification onVerified={onVerified} />);

    // Set date of birth to 30+ years ago
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1990' } });

    fireEvent.click(screen.getByRole('button', { name: /ยืนยัน/ }));

    expect(onVerified).toHaveBeenCalledTimes(1);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sabai_age_verified',
      expect.any(String),
    );

    // Check the stored value
    const storedValue = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(storedValue.verified).toBe(true);
    expect(storedValue.minimumAge).toBe(20);
    expect(storedValue.timestamp).toBeDefined();
  });

  it('rejects user who is too young', () => {
    render(<AgeVerification onVerified={onVerified} />);

    const currentYear = new Date().getFullYear();

    // Set date of birth to 10 years ago
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: String(currentYear - 10) } });

    fireEvent.click(screen.getByRole('button', { name: /ยืนยัน/ }));

    expect(onVerified).not.toHaveBeenCalled();
    // Error message should appear
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/คุณอายุไม่ถึงเกณฑ์ที่กำหนด/)).toBeInTheDocument();
  });

  it('persists verification in localStorage', () => {
    render(<AgeVerification onVerified={onVerified} />);

    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '15' } });
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '6' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '1985' } });

    fireEvent.click(screen.getByRole('button', { name: /ยืนยัน/ }));

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sabai_age_verified',
      expect.stringContaining('"verified":true'),
    );
  });

  it('respects custom minimumAge prop', () => {
    render(<AgeVerification minimumAge={18} onVerified={onVerified} />);

    expect(screen.getByText(/คุณต้องมีอายุ 18 ปีขึ้นไป/)).toBeInTheDocument();

    const currentYear = new Date().getFullYear();

    // Set age to exactly 18 (born this month, earlier day)
    fireEvent.change(screen.getByLabelText('Day'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: String(currentYear - 18) } });

    fireEvent.click(screen.getByRole('button', { name: /ยืนยัน/ }));

    expect(onVerified).toHaveBeenCalledTimes(1);
  });

  it('has correct aria attributes on the dialog', () => {
    render(<AgeVerification onVerified={onVerified} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'Age verification');
  });
});
