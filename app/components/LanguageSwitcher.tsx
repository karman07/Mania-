"use client";

import { useState, useRef, useEffect } from "react";
import { LANGUAGES, type LangCode } from "@/app/lib/translations";
import { useLanguage } from "./LanguageProvider";
import { IconGlobe } from "./Icons";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Switch language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border-2 border-saffron/25 dark:border-saffron-bright/20 hover:border-saffron dark:hover:border-saffron-bright hover:bg-saffron/8 text-ink/70 dark:text-cream/70 hover:text-saffron dark:hover:text-saffron-bright transition-all text-xs font-bold"
      >
        <IconGlobe size={14} />
        <span>{current.short}</span>
        <svg
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 rounded-xl bg-white dark:bg-[#1A1130] border border-saffron/15 dark:border-saffron-bright/10 shadow-xl shadow-ink/10 dark:shadow-black/40 overflow-hidden z-50">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as LangCode); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                lang === l.code
                  ? "bg-saffron/10 dark:bg-saffron/15 text-saffron dark:text-saffron-bright font-bold"
                  : "text-ink/70 dark:text-cream/70 hover:bg-saffron/5 dark:hover:bg-saffron/8 hover:text-saffron dark:hover:text-saffron-bright"
              }`}
            >
              <span>{l.label}</span>
              <span className="text-xs opacity-50 font-mono">{l.short}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
