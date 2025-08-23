'use client';

import { useState, useEffect, ReactNode } from 'react';
import { translations, languages, type Language, type TranslationKey } from '@/lib/i18n';
import { LanguageContext } from '@/lib/hooks/useLanguage';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(languages[0]); // Default to English

  useEffect(() => {
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('language');
    if (savedLang) {
      const lang = languages.find(l => l.code === savedLang);
      if (lang) {
        setLanguageState(lang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang.code);
    document.documentElement.lang = lang.code;
    document.documentElement.dir = lang.dir;
  };

  const t = (key: TranslationKey): string => {
    return translations[language.code][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}