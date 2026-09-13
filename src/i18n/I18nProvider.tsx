import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "./translations";
import { homeTranslations } from "./homeTranslations";
import { pagesTranslations } from "./pagesTranslations";

type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string };
const I18nContext = createContext<I18nContextValue | null>(null);
function getInitialLanguage(): Language { const saved = localStorage.getItem("aapi-language"); return saved === "fr" || saved === "en" || saved === "ar" ? saved : "ar"; }
function resolveKey(source: unknown, parts: string[]): unknown { let value = source; for (const part of parts) { if (!value || typeof value !== "object") return undefined; value = (value as Record<string, unknown>)[part]; } return value; }
export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("aapi-language", next); };
  useEffect(() => { document.documentElement.lang = language; document.documentElement.dir = language === "ar" ? "rtl" : "ltr"; document.body.dataset.language = language; }, [language]);
  const value = useMemo<I18nContextValue>(() => ({ language, setLanguage, t: (key: string) => { const parts = key.split("."); const current = resolveKey(translations[language], parts); if (typeof current === "string") return current; const home = resolveKey(homeTranslations[language], parts); if (typeof home === "string") return home; const page = resolveKey(pagesTranslations[language], parts); if (typeof page === "string") return page; const fallback = resolveKey(translations.ar, parts); if (typeof fallback === "string") return fallback; const homeFallback = resolveKey(homeTranslations.ar, parts); if (typeof homeFallback === "string") return homeFallback; const pageFallback = resolveKey(pagesTranslations.ar, parts); return typeof pageFallback === "string" ? pageFallback : key; } }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
export function useTranslation() { const context = useContext(I18nContext); if (!context) throw new Error("useTranslation must be used inside I18nProvider"); return context; }
