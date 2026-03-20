/**
 * PdpaConsent — Bottom-sheet PDPA consent form for Thai regulatory compliance.
 *
 * Thailand's Personal Data Protection Act (PDPA) B.E. 2562 (2019) requires
 * explicit, informed consent before collecting personal data. This component
 * implements a compliant consent form with:
 * - No pre-checked checkboxes (PDPA §19 requirement)
 * - Required vs optional consent items
 * - Timestamped consent record for audit trail
 *
 * @example
 * ```tsx
 * <PdpaConsent
 *   onAccept={(record) => saveConsent(record)}
 * />
 * ```
 *
 * @module @sabai/ui/PdpaConsent
 */

import { useState, useCallback, useMemo, type CSSProperties, type ReactElement } from 'react';
import type { PdpaConsentProps, PdpaConsentItem, PdpaConsentRecord } from './types';

/** localStorage key for persisting PDPA consent */
const STORAGE_KEY = 'sabai_pdpa_consent';

/** Default consent items per Thai PDPA requirements */
const DEFAULT_ITEMS: PdpaConsentItem[] = [
  {
    id: 'data_collection',
    label: 'การเก็บรวบรวมข้อมูล / Data Collection',
    description:
      'ยินยอมให้เก็บรวบรวมข้อมูลส่วนบุคคลเพื่อการให้บริการ / Consent to collect personal data for service delivery',
    required: true,
  },
  {
    id: 'marketing',
    label: 'การส่งข้อมูลทางการตลาด / Marketing Communications',
    description:
      'ยินยอมรับข้อมูลข่าวสาร โปรโมชั่น และกิจกรรมทางการตลาด / Consent to receive news, promotions, and marketing activities',
    required: false,
  },
  {
    id: 'third_party',
    label: 'การแบ่งปันข้อมูลกับบุคคลที่สาม / Third-party Sharing',
    description:
      'ยินยอมให้แบ่งปันข้อมูลกับพันธมิตรทางธุรกิจ / Consent to share data with business partners',
    required: false,
  },
];

/* ──────────────────────── Inline Styles ──────────────────────── */

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 9999,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  sheet: {
    backgroundColor: '#16213e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: '28px 24px 32px',
    maxWidth: 520,
    width: '100%',
    maxHeight: '85vh',
    overflowY: 'auto' as const,
    boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#2a2a4a',
    borderRadius: 2,
    margin: '0 auto 20px',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 700,
    margin: '0 0 8px 0',
    textAlign: 'center' as const,
    lineHeight: 1.3,
  },
  titleSub: {
    color: '#8892b0',
    fontSize: 13,
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
    lineHeight: 1.4,
  },
  itemContainer: {
    marginBottom: 16,
    padding: '14px 16px',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    border: '1px solid #2a2a4a',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    cursor: 'pointer',
  },
  checkbox: {
    width: 20,
    height: 20,
    minWidth: 20,
    marginTop: 2,
    accentColor: '#d4af37',
    cursor: 'pointer',
  },
  itemLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 600,
    margin: 0,
    lineHeight: 1.4,
    flex: 1,
  },
  requiredAsterisk: {
    color: '#e74c3c',
    fontWeight: 700,
    marginLeft: 4,
  },
  itemDescription: {
    color: '#8892b0',
    fontSize: 12,
    margin: '8px 0 0 32px',
    lineHeight: 1.5,
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
    marginTop: 8,
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
    marginTop: 8,
  },
  requiredNote: {
    color: '#8892b0',
    fontSize: 12,
    margin: '0 0 16px 0',
    textAlign: 'center' as const,
  },
};

/**
 * PdpaConsent renders a bottom-sheet overlay for collecting PDPA consent.
 *
 * On acceptance, the consent record is persisted to `localStorage` under the
 * key `sabai_pdpa_consent` and the `onAccept` callback fires with the full
 * consent record suitable for server-side audit storage.
 */
export function PdpaConsent({
  items,
  onAccept,
  title = 'นโยบายความเป็นส่วนตัว\nPrivacy Policy',
  version = '1.0',
}: PdpaConsentProps): ReactElement {
  const consentItems = items ?? DEFAULT_ITEMS;

  // Initialize all consents to false (PDPA: no pre-checked boxes)
  const [consents, setConsents] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const item of consentItems) {
      initial[item.id] = false;
    }
    return initial;
  });

  /** Check that all required items are checked */
  const allRequiredChecked = useMemo(
    () => consentItems.filter((item) => item.required).every((item) => consents[item.id]),
    [consentItems, consents],
  );

  const toggleConsent = useCallback((id: string) => {
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleAccept = useCallback(() => {
    if (!allRequiredChecked) return;

    const record: PdpaConsentRecord = {
      version,
      timestamp: new Date().toISOString(),
      consents: { ...consents },
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // localStorage may be unavailable — proceed anyway
    }

    onAccept(record);
  }, [allRequiredChecked, version, consents, onAccept]);

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="PDPA consent">
      <div style={styles.sheet}>
        {/* Drag handle indicator */}
        <div style={styles.handle} />

        {/* Title */}
        <h2 style={styles.title}>
          {title.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h2>

        <p style={styles.titleSub}>
          กรุณาอ่านและให้ความยินยอมก่อนดำเนินการต่อ
          <br />
          Please read and provide your consent to continue
        </p>

        {/* Required note */}
        <p style={styles.requiredNote}>
          <span style={{ color: '#e74c3c' }}>*</span> จำเป็นต้องยินยอม / Required
        </p>

        {/* Consent items */}
        {consentItems.map((item) => (
          <div key={item.id} style={styles.itemContainer}>
            <label style={styles.itemHeader}>
              <input
                type="checkbox"
                checked={consents[item.id] ?? false}
                onChange={() => toggleConsent(item.id)}
                style={styles.checkbox}
                aria-required={item.required}
              />
              <span style={styles.itemLabel}>
                {item.label}
                {item.required && <span style={styles.requiredAsterisk}>*</span>}
              </span>
            </label>
            {item.description && <p style={styles.itemDescription}>{item.description}</p>}
          </div>
        ))}

        {/* Accept button */}
        <button
          type="button"
          style={allRequiredChecked ? styles.button : styles.buttonDisabled}
          disabled={!allRequiredChecked}
          onClick={handleAccept}
          aria-disabled={!allRequiredChecked}
        >
          ยอมรับ / Accept
        </button>
      </div>
    </div>
  );
}
