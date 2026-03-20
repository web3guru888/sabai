import { useTranslation } from 'react-i18next';
import type { TimeSlot } from '../types';

const TIME_SLOTS: TimeSlot[] = [
  { id: '1', label: '09:00 - 11:00', available: true },
  { id: '2', label: '11:00 - 14:00', available: false }, // Restricted hours
  { id: '3', label: '14:00 - 17:00', available: true },
  { id: '4', label: '17:00 - 20:00', available: false }, // Restricted hours
  { id: '5', label: '20:00 - 22:00', available: true },
];

interface TimeSlotPickerProps {
  selected: string | null;
  onSelect: (slotId: string) => void;
}

export function TimeSlotPicker({ selected, onSelect }: TimeSlotPickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot.id}
          disabled={!slot.available}
          onClick={() => slot.available && onSelect(slot.id)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            !slot.available
              ? 'bg-sabai-surface/50 text-sabai-muted/50 cursor-not-allowed'
              : selected === slot.id
                ? 'bg-sabai-gold text-sabai-dark ring-2 ring-sabai-gold-light'
                : 'bg-sabai-card text-sabai-text hover:ring-1 hover:ring-sabai-gold/30'
          }`}
        >
          <span>{slot.label}</span>
          {!slot.available && (
            <span className="text-xs text-sabai-muted/50">{t('checkout.restricted')}</span>
          )}
          {slot.available && selected === slot.id && <span>✓</span>}
        </button>
      ))}
    </div>
  );
}
