import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getLanguage, setLanguage as i18nSetLanguage } from '../utils/i18n';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getLanguage);

  // Keep state in sync when setLanguage is called from outside React (e.g. i18n utility)
  useEffect(() => {
    const handler = (e) => {
      setLanguageState(e.detail.language);
    };
    window.addEventListener('languagechange', handler);
    return () => window.removeEventListener('languagechange', handler);
  }, []);

  const setLanguage = useCallback((lang) => {
    i18nSetLanguage(lang);
    setLanguageState(lang);
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

export default LanguageContext;
