"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { DEFAULT_LOCALE, dictionaries, isLocale, LOCALE_STORAGE_KEY, type Locale } from "@/lib/i18n";

type LocaleContextValue = { locale: Locale; dictionary: (typeof dictionaries)[Locale]; setLocale: (locale: Locale) => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore(
    (notify) => { window.addEventListener("storage", notify); window.addEventListener("zecar-locale", notify); return () => { window.removeEventListener("storage", notify); window.removeEventListener("zecar-locale", notify); }; },
    () => { const saved = localStorage.getItem(LOCALE_STORAGE_KEY); return isLocale(saved) ? saved : DEFAULT_LOCALE; },
    () => DEFAULT_LOCALE,
  );
  const setLocale = (next: Locale) => {
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    window.dispatchEvent(new Event("zecar-locale"));
  };
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const value = useMemo(() => ({ locale, dictionary: dictionaries[locale], setLocale }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used inside LocaleProvider");
  return value;
}
