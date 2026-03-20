// @sabai/core — Internationalization (i18n) with LINE language detection

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { I18nConfig } from './types';

/**
 * Detect the user's preferred language from the LINE client or browser.
 *
 * Priority: navigator language → fallback to Thai ('th').
 * Only returns 'en' or 'th' since those are the supported locales.
 *
 * @returns A two-letter language code ('en' or 'th').
 */
export function detectLineLanguage(): string {
  if (typeof window !== 'undefined') {
    const navigatorLang = navigator.language?.split('-')[0];
    if (navigatorLang === 'en' || navigatorLang === 'th') {
      return navigatorLang;
    }
  }
  return 'th'; // Thai as default for LINE Thailand apps
}

/**
 * Initialize the i18next instance with React bindings and LINE-aware defaults.
 *
 * Configures i18next with the provided translation resources, auto-detects
 * the user's language from LINE/browser, and falls back to Thai.
 *
 * @param config - i18n configuration with translation resources.
 * @returns The initialized i18next instance.
 *
 * @example
 * ```ts
 * setupI18n({
 *   resources: {
 *     en: { translation: { greeting: 'Hello' } },
 *     th: { translation: { greeting: 'สวัสดี' } },
 *   },
 * });
 * ```
 */
export function setupI18n(config: I18nConfig): typeof i18next {
  const defaultLang = config.defaultLanguage || detectLineLanguage();

  void i18next.use(initReactI18next).init({
    resources: config.resources,
    lng: defaultLang,
    fallbackLng: 'th',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

  return i18next;
}
