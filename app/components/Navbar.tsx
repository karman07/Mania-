"use client";

import { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { IconSearch, IconSun, IconMoon } from "./Icons";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t.nav.browse,    href: "#featured"  },
    { label: t.nav.topCharts, href: "#genres"    },
    { label: t.nav.freeManga, href: "#free"      },
    { label: t.nav.creators,  href: "#characters" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/90 dark:bg-[#0C0818]/90 backdrop-blur-md shadow-lg shadow-saffron/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <a href="#" className="flex items-center gap-1.5 group">
            <span className="text-3xl md:text-4xl font-display tracking-wider gradient-text leading-none">
              RaManga
            </span>
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-ink/70 dark:text-cream/70 hover:text-saffron dark:hover:text-saffron-bright transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-saffron dark:bg-saffron-bright rounded-full transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Search"
              className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full text-ink/60 dark:text-cream/60 hover:text-saffron dark:hover:text-saffron-bright hover:bg-saffron/10 transition-all"
            >
              <IconSearch size={18} />
            </button>

            {/* Language switcher */}
            <LanguageSwitcher />

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-9 h-9 flex items-center justify-center rounded-full border-2 border-saffron/30 dark:border-saffron-bright/30 hover:border-saffron dark:hover:border-saffron-bright hover:bg-saffron/10 text-ink dark:text-cream transition-all"
            >
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>

            <a
              href="#"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-saffron text-white text-sm font-semibold hover:bg-saffron/90 transition-all manga-border hover:shadow-lg hover:shadow-saffron/30 active:scale-95"
            >
              {t.nav.startReading}
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5"
              aria-label="Menu"
            >
              <span className={`block w-5 h-0.5 bg-ink dark:bg-cream transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <span className={`block w-5 h-0.5 bg-ink dark:bg-cream transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-5 h-0.5 bg-ink dark:bg-cream transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-72 opacity-100" : "max-h-0 opacity-0"
        } bg-cream dark:bg-[#0C0818] border-t border-saffron/20`}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-semibold text-ink/80 dark:text-cream/80 hover:text-saffron dark:hover:text-saffron-bright transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-3 pt-1">
            <a href="#" className="px-5 py-2.5 rounded-full bg-saffron text-white font-semibold text-sm">
              {t.nav.startReading}
            </a>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
