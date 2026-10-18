'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useLayoutEffect } from 'react';
import { translations } from '@/lib/translations';

export type Language = 'ar' | 'en';
export type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getDirection = (lang: Language): Direction => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ar');

  useEffect(() => {
    try {
      const storedLang = window.localStorage.getItem('language') as Language | null;
      if (storedLang && Object.keys(translations).includes(storedLang)) {
        setLanguageState(storedLang);
      }
    } catch (error) {
      console.warn("localStorage access denied in LanguageProvider:", error);
    }
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = getDirection(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      window.localStorage.setItem('language', lang);
    } catch (e) {}
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const value = {
    language,
    setLanguage,
    direction: getDirection(language),
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
