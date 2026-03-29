/**
 * i18n utility for AgriPredict AI
 * Provides t(key), setLanguage(lang), getLanguage(), and addMissingKey(key)
 */
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import od from '../locales/od.json';

const STORAGE_KEY = 'agri_language';
const SUPPORTED_LANGUAGES = ['en', 'hi', 'od'];

const translations = { en, hi, od };

// Resolve a dot-separated key in a nested object
function resolve(obj, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

/**
 * Get the translation for a given dot-separated key.
 * Falls back to English if the key is missing in the current language.
 * Logs a warning and returns the key itself as last resort.
 */
export function t(key) {
  const lang = getLanguage();
  const value = resolve(translations[lang], key) ?? resolve(translations['en'], key);
  if (value === undefined) {
    addMissingKey(key);
    return key;
  }
  return value;
}

/**
 * Get the currently active language code.
 */
export function getLanguage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return SUPPORTED_LANGUAGES.includes(stored) ? stored : 'en';
}

/**
 * Change the active language and persist it to localStorage.
 * Dispatches a custom 'languagechange' event so React components can re-render.
 */
export function setLanguage(lang) {
  const code = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  localStorage.setItem(STORAGE_KEY, code);
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: code } }));
}

/**
 * Log a missing translation key to the console (development aid).
 */
export function addMissingKey(key) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[i18n] Missing translation key: "${key}"`);
  }
}

const i18n = { t, getLanguage, setLanguage, addMissingKey };
export default i18n;
