"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { useAuth } from "./AuthProvider";
import { IconBook, IconPencil, IconUsers, IconGift, IconArrowRight } from "./Icons";

const STAT_ICONS = [IconBook, IconPencil, IconUsers, IconGift];

export default function StatsSection() {
  const { t } = useLanguage();
  const { user, openDialog } = useAuth();

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-ink dark:bg-[#090909]">
      <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-saffron/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-20 w-1/2 h-full bg-white/[0.015] rotate-6 transform-gpu" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-saffron uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-saffron" />
            {t.stats.eyebrow}
            <span className="w-6 h-px bg-saffron" />
          </p>
          <h2 className="font-display text-5xl sm:text-6xl text-white tracking-wider">
            {t.stats.h1}{" "}
            <span className="text-gold-light">{t.stats.h2}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {t.stats.items.map(({ label, desc }, i) => {
            const Icon = STAT_ICONS[i];
            const values = ["10,000+", "500+", "2M+", "100+"];
            return (
              <div
                key={i}
                className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-saffron/40 p-6 flex flex-col gap-3 text-center transition-all duration-300 hover:bg-white/8 hover:scale-105"
              >
                <div className="w-10 h-10 rounded-xl bg-saffron/15 border border-saffron/25 flex items-center justify-center mx-auto group-hover:bg-saffron/25 transition-colors">
                  <Icon size={20} className="text-saffron" />
                </div>
                <div>
                  <p className="font-display text-4xl sm:text-5xl text-white tracking-wide">{values[i]}</p>
                  <p className="text-sm font-bold text-saffron mt-1">{label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA — only for guests */}
        {!user && (
          <div className="mt-16 rounded-2xl bg-gradient-to-r from-[#6B0000] via-saffron to-[#E32929] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 manga-border">
            <div>
              <h3 className="font-display text-4xl text-white tracking-wider">{t.stats.ctaH}</h3>
              <p className="text-white/80 text-sm mt-1">{t.stats.ctaB}</p>
            </div>
            <div className="flex flex-wrap gap-3 flex-shrink-0">
              <button
                onClick={openDialog}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-saffron font-bold text-sm hover:bg-cream transition-all hover:scale-105 active:scale-95 manga-border"
              >
                {t.stats.cta1}
                <IconArrowRight size={14} />
              </button>
              <Link href="/browse" className="px-6 py-3 rounded-full border-2 border-white/50 text-white font-semibold text-sm hover:border-white hover:bg-white/10 transition-all">
                {t.stats.cta2}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
