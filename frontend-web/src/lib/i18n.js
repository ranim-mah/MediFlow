import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ar from '@/locales/ar/translation.json';
import fr from '@/locales/fr/translation.json';
import en from '@/locales/en/translation.json';

export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
];

export const getDir = (lang) => LANGUAGES.find((l) => l.code === lang)?.dir || 'ltr';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      fr: { translation: fr },
      en: { translation: en },
    },
    fallbackLng: 'ar',
    supportedLngs: ['ar', 'fr', 'en'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'mediflow.lang',
    },
  });

// Keep <html lang> and <html dir> in sync
const applyHtmlAttrs = (lang) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = getDir(lang);
};

applyHtmlAttrs(i18n.language || 'ar');
i18n.on('languageChanged', applyHtmlAttrs);

export default i18n;
