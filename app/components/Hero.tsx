"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import {
  IconBook, IconPencil, IconUsers, IconGift,
  IconTrendingUp, IconArrowRight, IconChevronDown, IconStar,
} from "./Icons";

export default function Hero() {
  const { t } = useLanguage();
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible]     = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setWordIndex((i) => (i + 1) % t.hero.words.length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [t.hero.words.length]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-cream dark:bg-[#0C0818] pt-20">
      <div className="absolute inset-0 halftone opacity-60 dark:opacity-40 pointer-events-none" />
      <div className="absolute inset-0 speed-lines pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-saffron/10 dark:bg-saffron/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-gold/10 dark:bg-gold/5 blur-3xl pointer-events-none" />

      {/* Floating shapes */}
      <div className="absolute top-24 left-12 w-16 h-16 border-4 border-saffron/30 dark:border-saffron-bright/20 rounded-lg rotate-12 animate-spin-slow opacity-60" />
      <div className="absolute top-48 left-[8%] w-8 h-8 bg-gold/30 dark:bg-gold/20 rounded-full animate-float-slow" />
      <div className="absolute bottom-40 left-[15%] w-12 h-12 border-2 border-maroon/20 dark:border-saffron-bright/15 rounded-full animate-float" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center min-h-[calc(100vh-5rem)]">

          {/* Left */}
          <div className="flex flex-col gap-6 py-16 lg:py-0 relative z-10">

            {/* Heading */}
            <div className="reveal reveal-delay-1">
              <h1 className="font-display text-7xl sm:text-8xl lg:text-9xl leading-none tracking-wider">
                <span className="gradient-text">Ra</span>
                <span className="text-ink dark:text-cream">Manga</span>
              </h1>
              <div className="mt-2 h-12 overflow-hidden">
                <p
                  className={`font-display text-3xl sm:text-4xl text-saffron dark:text-saffron-bright tracking-wide transition-all duration-300 ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                >
                  {t.hero.words[wordIndex]}
                </p>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl sm:text-2xl font-semibold text-gold dark:text-gold-light reveal reveal-delay-2">
              {t.hero.subtitle}
            </p>

            <p className="text-base sm:text-lg text-ink/70 dark:text-cream/70 max-w-lg leading-relaxed reveal reveal-delay-2">
              {t.hero.body}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 reveal reveal-delay-3">
              <a
                href="#featured"
                className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-saffron text-white font-semibold text-base manga-border hover:bg-saffron/90 transition-all animate-pulse-glow hover:scale-105 active:scale-95"
              >
                {t.hero.cta1}
                <IconArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#genres"
                className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-ink/20 dark:border-cream/20 text-ink dark:text-cream font-semibold text-base hover:border-saffron dark:hover:border-saffron-bright hover:text-saffron dark:hover:text-saffron-bright transition-all hover:scale-105 active:scale-95"
              >
                {t.hero.cta2}
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 pt-2 reveal reveal-delay-4">
              {[
                { value: "10K+", label: t.hero.statManga,    Icon: IconBook    },
                { value: "500+", label: t.hero.statCreators, Icon: IconPencil  },
                { value: "2M+",  label: t.hero.statReaders,  Icon: IconUsers   },
                { value: "100+", label: t.hero.statFree,     Icon: IconGift    },
              ].map(({ value, label, Icon }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={16} className="text-saffron/60 dark:text-saffron-bright/60" />
                  <div className="flex flex-col">
                    <span className="font-display text-2xl text-saffron dark:text-saffron-bright tracking-wide leading-none">
                      {value}
                    </span>
                    <span className="text-xs text-ink/50 dark:text-cream/50 font-medium uppercase tracking-widest">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right – Character */}
          <div className="relative flex items-end justify-center lg:justify-end h-[480px] sm:h-[560px] lg:h-full">
            <div className="absolute bottom-8 right-4 lg:right-0 w-72 h-72 sm:w-96 sm:h-96">
              <div className="glow-ring inset-0 w-full h-full" style={{ animationDelay: "0s" }} />
              <div className="glow-ring inset-0 w-full h-full" style={{ animationDelay: "0.6s" }} />
              <div className="glow-ring inset-0 w-full h-full" style={{ animationDelay: "1.2s" }} />
            </div>
            <div className="absolute bottom-0 right-0 w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-gradient-to-br from-saffron/20 via-gold/15 to-transparent dark:from-saffron/10 dark:via-gold/8 dark:to-transparent blur-xl pointer-events-none" />

            <div className="relative z-10 animate-float">
              <Image
                src="/luffy.png"
                alt="Manga character"
                width={420}
                height={560}
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>

            {/* Floating chips */}
            <div className="absolute top-12 right-8 sm:right-16 bg-cream dark:bg-[#1A1130] manga-border rounded-lg px-3 py-2 animate-float-slow text-xs font-semibold text-ink dark:text-cream shadow-lg flex items-center gap-1.5">
              <IconStar size={12} filled className="text-gold dark:text-gold-light" />
              <span>4.9</span>
              <span className="text-ink/50 dark:text-cream/50">Karma Warriors</span>
            </div>
            <div className="absolute top-32 left-4 sm:left-8 bg-jade text-white rounded-full px-3 py-1 text-xs font-black shadow-lg animate-float flex items-center gap-1" style={{ animationDelay: "1s" }}>
              <IconGift size={10} />
              {t.hero.free}
            </div>
            <div className="absolute bottom-24 right-4 sm:right-8 bg-parchment dark:bg-[#211940] manga-border rounded-lg px-3 py-2 animate-float-fast text-xs font-semibold text-ink dark:text-cream shadow-lg flex items-center gap-1.5" style={{ animationDelay: "0.5s" }}>
              <IconTrendingUp size={12} className="text-saffron dark:text-saffron-bright" />
              {t.hero.trending}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <IconChevronDown size={16} className="text-saffron/60 dark:text-saffron-bright/60" />
      </div>
    </section>
  );
}
