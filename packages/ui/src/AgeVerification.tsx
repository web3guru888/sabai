/**
 * AgeVerification — Full-screen age gate for Thai regulatory compliance.
 *
 * Under Thai Alcoholic Beverage Control Act B.E. 2551 (2008), the legal
 * drinking age is 20. This component provides a date-of-birth based age
 * verification gate with accurate boundary-day calculation.
 *
 * Features:
 * - Month-aware day validation (prevents impossible dates like Feb 31)
 * - Focus trapping within the modal (WCAG 2.1 AA compliance)
 * - Accurate age calculation with birthday boundary handling
 *
 * @example
 * ```tsx
 * <AgeVerification
 *   minimumAge={20}
 *   onVerified={() => setVerified(true)}
 * />
 * ```
 *
 * @module @sabai/ui/AgeVerification
 */

import { useState, useCallback, useMemo, useEffect, useRef, type CSSProperties, type ReactElement } from 'react';
import type { AgeVerificationProps } from './types';

/** Thai month names for the date selector */
const THAI_MONTHS = [
  'มกราคม (January)',
  'กุมภาพันธ์ (February)',
  'มีนาคม (March)',
  'เมษายน (April)',
  'พฤษภาคม (May)',
  'มิถุนายน (June)',
  'กรกฎาคม (July)',
  'สิงหาคม (August)',
  'กันยายน (September)',
  'ตุลาคม (October)',
  'พฤศจิกายน (November)',
  'ธันวาคม (December)',
] as const;

/** localStorage key for persisting verification state */
const STORAGE_KEY = 'sabai_age_verified';

/**
 * Calculates a person's age from their date of birth, handling
 * month and day boundaries accurately.
 */
function calculateAge(day: number, month: number, year: number): number {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1; // 1-based
  const todayDay = today.getDate();

  let age = todayYear - year;

  // If birthday hasn't occurred yet this year, subtract one
  if (month > todayMonth || (month === todayMonth && day > todayDay)) {
    age--;
  }

  return age;
}

/**
 * Returns the number of days in a given month/year combination.
 * Defaults to 31 if month or year are not yet selected.
 */
function getDaysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

/** Selector string for all focusable elements within a container */
const FOCUSABLE_SELECTORS = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

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
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 700,
    margin: '0 0 8px 0',
    lineHeight: 1.3,
  },
  subtitle: {
    color: '#8892b0',
    fontSize: 14,
    margin: '0 0 28px 0',
    lineHeight: 1.5,
  },
  selectRow: {
    display: 'flex',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  select: {
    flex: 1,
    padding: '12px 8px',
    borderRadius: 8,
    border: '1px solid #2a2a4a',
    backgroundColor: '#1a1a2e',
    color: '#ffffff',
    fontSize: 14,
    appearance: 'auto' as CSSProperties['appearance'],
    cursor: 'pointer',
    outline: 'none',
    maxWidth: 140,
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#d4af37',
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  buttonDisabled: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#d4af37',
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  error: {
    color: '#e74c3c',
    fontSize: 14,
    margin: '12px 0 0 0',
    lineHeight: 1.4,
  },
};

/**
 * AgeVerification renders a full-screen overlay that requires the user to
 * enter their date of birth and verifies they meet the minimum age.
 *
 * On successful verification, the result is persisted to `localStorage`
 * under the key `sabai_age_verified` and the `onVerified` callback fires.
 *
 * The dialog traps focus within its bounds (WCAG 2.1 AA) and validates
 * day selection against the chosen month/year to prevent impossible dates.
 */
export function AgeVerification({
  minimumAge = 20,
  onVerified,
  title = 'กรุณายืนยันอายุ\nPlease verify your age',
  subtitle,
}: AgeVerificationProps): ReactElement {
  const [day, setDay] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  /** Ref to the dialog container for focus trapping */
  const dialogRef = useRef<HTMLDivElement>(null);

  const resolvedSubtitle =
    subtitle ??
    `คุณต้องมีอายุ ${minimumAge} ปีขึ้นไป\nYou must be ${minimumAge} years or older`;

  /** Generate year options (last 100 years) */
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 100; y--) {
      years.push(y);
    }
    return years;
  }, []);

  /** Calculate max days for the selected month/year */
  const maxDays = useMemo(() => {
    const monthNum = month ? parseInt(month, 10) : 0;
    const yearNum = year ? parseInt(year, 10) : 0;
    return getDaysInMonth(monthNum, yearNum);
  }, [month, year]);

  /** Reset day if it exceeds the max for the new month/year */
  useEffect(() => {
    if (day !== '') {
      const dayNum = parseInt(day, 10);
      if (dayNum > maxDays) {
        setDay('');
      }
    }
  }, [maxDays, day]);

  const allSelected = day !== '' && month !== '' && year !== '';

  /** Focus trap: keep Tab/Shift+Tab cycling within the modal */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableElements = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first interactive element on mount
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    dialog.addEventListener('keydown', handleKeyDown);
    return () => dialog.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!allSelected) return;

    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    const age = calculateAge(dayNum, monthNum, yearNum);

    if (age >= minimumAge) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            verified: true,
            timestamp: new Date().toISOString(),
            minimumAge,
          }),
        );
      } catch {
        // localStorage may be unavailable — proceed anyway
      }
      setErrorMessage('');
      onVerified();
    } else {
      setErrorMessage(
        'คุณอายุไม่ถึงเกณฑ์ที่กำหนด\nYou do not meet the minimum age requirement',
      );
    }
  }, [day, month, year, allSelected, minimumAge, onVerified]);

  return (
    <div ref={dialogRef} style={styles.overlay} role="dialog" aria-modal="true" aria-label="Age verification">
      <div style={styles.card}>
        {/* Title */}
        <h1 style={styles.title}>
          {title.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p style={styles.subtitle}>
          {resolvedSubtitle.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>

        {/* Date selectors */}
        <div style={styles.selectRow}>
          {/* Day — dynamically capped to valid days for the selected month/year */}
          <select
            style={styles.select}
            value={day}
            onChange={(e) => {
              setDay(e.target.value);
              setErrorMessage('');
            }}
            aria-label="Day"
          >
            <option value="">วัน / Day</option>
            {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Month */}
          <select
            style={styles.select}
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setErrorMessage('');
            }}
            aria-label="Month"
          >
            <option value="">เดือน / Month</option>
            {THAI_MONTHS.map((name, i) => (
              <option key={i + 1} value={i + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year */}
          <select
            style={styles.select}
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setErrorMessage('');
            }}
            aria-label="Year"
          >
            <option value="">ปี / Year</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Submit button */}
        <button
          type="button"
          style={allSelected ? styles.button : styles.buttonDisabled}
          disabled={!allSelected}
          onClick={handleSubmit}
          aria-disabled={!allSelected}
        >
          ยืนยัน / Confirm
        </button>

        {/* Error message */}
        {errorMessage && (
          <p style={styles.error} role="alert">
            {errorMessage.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}
