"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations, LANGUAGES, type LangCode, type T } from "@/app/lib/translations";

type LanguageCtx = { lang: LangCode; setLang: (c: LangCode) => void; t: T };

const LanguageContext = createContext<LanguageCtx>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function useLanguage() {
  return useContext(LanguageContext);
}

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const stored = localStorage.getItem("ramanga-lang") as LangCode | null;
    const valid = LANGUAGES.map((l) => l.code) as LangCode[];
    if (stored && valid.includes(stored)) setLangState(stored);
  }, []);

  function setLang(code: LangCode) {
    setLangState(code);
    localStorage.setItem("ramanga-lang", code);
    document.documentElement.lang = code;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}
