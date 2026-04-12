import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language, TranslationKeys } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  t: TranslationKeys;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  t: translations.en,
  toggleLanguage: () => {},
  setLanguage: () => {},
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem("lang");
    return (saved === "en" || saved === "ar") ? saved : "en";
  });

  const persistLanguage = (next: Language) => {
    localStorage.setItem("lang", next);
    setLang(next);
  };

  const toggleLanguage = () => {
    persistLanguage(lang === "ar" ? "en" : "ar");
  };

  const setLanguage = (next: Language) => {
    persistLanguage(next);
  };

  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], toggleLanguage, setLanguage, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
