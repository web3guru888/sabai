import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PdpaConsent } from '../src/PdpaConsent';

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

describe('PdpaConsent', () => {
  const onAccept = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  it('renders with default consent items', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/นโยบายความเป็นส่วนตัว/)).toBeInTheDocument();
    expect(screen.getByText(/Privacy Policy/)).toBeInTheDocument();

    // Check default items are rendered
    expect(screen.getByText(/การเก็บรวบรวมข้อมูล/)).toBeInTheDocument();
    expect(screen.getByText(/การส่งข้อมูลทางการตลาด/)).toBeInTheDocument();
    expect(screen.getByText(/การแบ่งปันข้อมูลกับบุคคลที่สาม/)).toBeInTheDocument();
  });

  it('no checkboxes are pre-checked (PDPA requirement)', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(3);

    checkboxes.forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  it('accept button is disabled until required items are checked', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    const acceptButton = screen.getByRole('button', { name: /ยอมรับ/ });
    expect(acceptButton).toBeDisabled();

    // Check the required data_collection checkbox (first one)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // data_collection is required

    // Now the button should be enabled (data_collection is the only required default)
    expect(acceptButton).not.toBeDisabled();
  });

  it('calls onAccept with correct consent record', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    const checkboxes = screen.getAllByRole('checkbox');

    // Check data_collection (required)
    fireEvent.click(checkboxes[0]);
    // Check marketing (optional)
    fireEvent.click(checkboxes[1]);
    // Leave third_party unchecked

    const acceptButton = screen.getByRole('button', { name: /ยอมรับ/ });
    fireEvent.click(acceptButton);

    expect(onAccept).toHaveBeenCalledTimes(1);

    const record = onAccept.mock.calls[0][0];
    expect(record.version).toBe('1.0');
    expect(record.timestamp).toBeDefined();
    expect(record.consents.data_collection).toBe(true);
    expect(record.consents.marketing).toBe(true);
    expect(record.consents.third_party).toBe(false);
  });

  it('stores consent in localStorage with timestamp', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // required

    const acceptButton = screen.getByRole('button', { name: /ยอมรับ/ });
    fireEvent.click(acceptButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'sabai_pdpa_consent',
      expect.any(String),
    );

    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored.version).toBe('1.0');
    expect(stored.timestamp).toBeDefined();
    expect(stored.consents.data_collection).toBe(true);
  });

  it('supports custom items', () => {
    const customItems = [
      {
        id: 'custom_required',
        label: 'Custom Required Item',
        description: 'This is required',
        required: true,
      },
      {
        id: 'custom_optional',
        label: 'Custom Optional Item',
        description: 'This is optional',
        required: false,
      },
    ];

    render(<PdpaConsent items={customItems} onAccept={onAccept} />);

    expect(screen.getByText('Custom Required Item')).toBeInTheDocument();
    expect(screen.getByText('Custom Optional Item')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(2);

    // Button should be disabled until required is checked
    const acceptButton = screen.getByRole('button', { name: /ยอมรับ/ });
    expect(acceptButton).toBeDisabled();

    // Check required
    fireEvent.click(checkboxes[0]);
    expect(acceptButton).not.toBeDisabled();
  });

  it('supports custom version', () => {
    render(<PdpaConsent onAccept={onAccept} version="2.0" />);

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // required

    fireEvent.click(screen.getByRole('button', { name: /ยอมรับ/ }));

    const record = onAccept.mock.calls[0][0];
    expect(record.version).toBe('2.0');
  });

  it('has correct aria attributes', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-label', 'PDPA consent');
  });

  it('toggling a checkbox off and on works', () => {
    render(<PdpaConsent onAccept={onAccept} />);

    const checkboxes = screen.getAllByRole('checkbox');
    const dataCollection = checkboxes[0];

    // Check it
    fireEvent.click(dataCollection);
    expect(dataCollection).toBeChecked();

    // Uncheck it
    fireEvent.click(dataCollection);
    expect(dataCollection).not.toBeChecked();

    // Button should be disabled again
    const acceptButton = screen.getByRole('button', { name: /ยอมรับ/ });
    expect(acceptButton).toBeDisabled();
  });
});
