import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { deepMergeLocale, resolveMessage } from '../i18n/resolveMessage';
import enRaw from '../i18n/locales/en.json';
import hiRaw from '../i18n/locales/hi.json';
import taRaw from '../i18n/locales/ta.json';
import teRaw from '../i18n/locales/te.json';
import mlRaw from '../i18n/locales/ml.json';
import knRaw from '../i18n/locales/kn.json';

const STORAGE_KEY = 'citizenone-locale';

export const SUPPORTED_LOCALES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

/** BCP 47 tags for Web Speech API (India regional where applicable) */
export const LOCALE_SPEECH_MAP = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
};

const CATALOG = {
  en: enRaw,
  hi: hiRaw,
  ta: taRaw,
  te: teRaw,
  ml: mlRaw,
  kn: knRaw,
};

function readStoredLocale() {
  try {
    const v = String(localStorage.getItem(STORAGE_KEY) || '').toLowerCase();
    if (SUPPORTED_LOCALES.some((l) => l.code === v)) return v;
  } catch {
    /* ignore */
  }
  return 'en';
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() =>
    typeof window !== 'undefined' ? readStoredLocale() : 'en'
  );

  const messages = useMemo(() => {
    const base = CATALOG.en;
    if (locale === 'en') return base;
    return deepMergeLocale(base, CATALOG[locale] || {});
  }, [locale]);

  const setLocale = useCallback((code) => {
    const next = SUPPORTED_LOCALES.some((l) => l.code === code) ? code : 'en';
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.setAttribute('data-locale', locale);
  }, [locale]);

  const t = useCallback(
    (key, vars) => {
      let s = resolveMessage(messages, key);
      if (s == null) s = resolveMessage(CATALOG.en, key);
      if (s == null) return key;
      if (vars && typeof vars === 'object') {
        return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
      }
      return s;
    },
    [messages]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      messages,
      speechLang: LOCALE_SPEECH_MAP[locale] || 'en-IN',
    }),
    [locale, setLocale, t, messages]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
