import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock i18next at the top level — vi.mock is hoisted
// We use vi.hoisted to create mock functions accessible inside vi.mock factories
const { mockInit, mockUse } = vi.hoisted(() => {
  const mockInit = vi.fn().mockResolvedValue(undefined);
  const mockUse = vi.fn().mockReturnValue({ init: mockInit });
  return { mockInit, mockUse };
});

vi.mock('i18next', () => ({
  default: {
    use: mockUse,
  },
}));

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: vi.fn() },
}));

// Import after mocks are set up
import { detectLineLanguage, setupI18n } from '../src/i18n';

describe('i18n Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the return value of mockUse for each test
    mockUse.mockReturnValue({ init: mockInit });
  });

  describe('detectLineLanguage', () => {
    it("returns 'th' as default when no navigator language", () => {
      const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'language');
      Object.defineProperty(navigator, 'language', {
        value: undefined,
        configurable: true,
      });

      expect(detectLineLanguage()).toBe('th');

      if (originalDescriptor) {
        Object.defineProperty(navigator, 'language', originalDescriptor);
      }
    });

    it("detects 'en' from navigator.language", () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });

      expect(detectLineLanguage()).toBe('en');
    });

    it("detects 'th' from navigator.language", () => {
      Object.defineProperty(navigator, 'language', {
        value: 'th-TH',
        configurable: true,
      });

      expect(detectLineLanguage()).toBe('th');
    });

    it("returns 'th' for unsupported languages (e.g. 'ja')", () => {
      Object.defineProperty(navigator, 'language', {
        value: 'ja-JP',
        configurable: true,
      });

      expect(detectLineLanguage()).toBe('th');
    });
  });

  describe('setupI18n', () => {
    it('initializes i18next with provided resources', () => {
      const resources = {
        en: { translation: { greeting: 'Hello' } },
        th: { translation: { greeting: 'สวัสดี' } },
      };

      setupI18n({ resources });

      expect(mockUse).toHaveBeenCalled();
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          resources,
          fallbackLng: 'th',
          interpolation: { escapeValue: false },
        }),
      );
    });

    it('uses provided defaultLanguage override', () => {
      const resources = {
        en: { translation: { greeting: 'Hello' } },
        th: { translation: { greeting: 'สวัสดี' } },
      };

      setupI18n({ resources, defaultLanguage: 'en' });

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en',
        }),
      );
    });

    it('auto-detects language when defaultLanguage is not provided', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true,
      });

      const resources = {
        en: { translation: { greeting: 'Hello' } },
        th: { translation: { greeting: 'สวัสดี' } },
      };

      setupI18n({ resources });

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: 'en',
        }),
      );
    });
  });
});
