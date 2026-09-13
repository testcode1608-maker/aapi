import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "./translations";
import { homeTranslations } from "./homeTranslations";
import { pagesTranslations } from "./pagesTranslations";
import { extraTranslations } from "./extraTranslations";
import { newsTranslations } from "./newsTranslations";
import { uiTranslations } from "./uiTranslations";
import { registrationTranslations } from "./registrationTranslations";
import { investorDashboardTranslations } from "./investorDashboardTranslations";
import { investorFormsTranslations } from "./investorFormsTranslations";

type I18nContextValue = { language: Language; setLanguage: (language: Language) => void; t: (key: string) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  const saved = localStorage.getItem("aapi-language");
  return saved === "fr" || saved === "en" || saved === "ar" ? saved : "ar";
}

function resolveKey(source: unknown, parts: string[]): unknown {
  let value = source;
  for (const part of parts) {
    if (!value || typeof value !== "object") return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return value;
}

function getSources(language: Language) {
  return [
    translations[language], homeTranslations[language], pagesTranslations[language], extraTranslations[language],
    newsTranslations[language], uiTranslations[language],
    { registrationPage: registrationTranslations[language] },
    { investorDashboard: investorDashboardTranslations[language] },
    { investorForms: investorFormsTranslations[language] },
  ];
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const setLanguage = (next: Language) => { setLanguageState(next); localStorage.setItem("aapi-language", next); };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.dataset.language = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(() => {
    const sources = getSources(language);
    const fallbackSources = getSources("ar");
    const t = (key: string): string => {
      const parts = key.split(".");
      for (const source of sources) { const result = resolveKey(source, parts); if (typeof result === "string") return result; }
      for (const source of fallbackSources) { const result = resolveKey(source, parts); if (typeof result === "string") return result; }
      return key;
    };
    return { language, setLanguage, t };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used inside I18nProvider");
  return context;
}
