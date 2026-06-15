"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { IconBook, IconPlay, IconGift } from "./Icons";

export default function FreeBanner() {
  const { t } = useLanguage();

  return (
    <section id="free" className="relative overflow-hidden">
      <div className="ink-bg py-16 md:py-20 relative">
        <div className="absolute inset-0 halftone opacity-30 pointer-events-none" />

        {/* Top ticker */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-ink/20 overflow-hidden flex items-center">
          <div className="ticker-inner flex gap-12 whitespace-nowrap text-white/60 text-xs font-bold uppercase tracking-widest">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
                {t.free.tag}
              </span>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

            {/* Left */}
            <div className="flex flex-col gap-5 text-center lg:text-left max-w-xl">
              <span className="inline-flex items-center gap-2 self-center lg:self-start px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-bold border border-white/30">
                <IconBook size={14} />
                {t.free.tag}
              </span>
              <h2 className="font-display text-5xl sm:text-6xl text-white tracking-wider leading-none">
                {t.free.h1}
                <br />
                <span className="text-gold-light">{t.free.h2}</span>
              </h2>
              <p className="text-white/80 text-base sm:text-lg leading-relaxed">
                {t.free.body}
              </p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  href="/browse?free=true"
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-saffron font-bold text-sm manga-border hover:bg-cream transition-all hover:scale-105 active:scale-95"
                >
                  {t.free.cta1}
                  <span className="text-base leading-none">→</span>
                </Link>
                <Link
                  href="/browse"
                  className="flex items-center gap-2 px-5 py-3 rounded-full border-2 border-white/40 text-white text-sm font-semibold hover:border-white/70 transition-all"
                >
                  <IconPlay size={14} />
                  {t.free.cta2}
                </Link>
              </div>
              <div className="flex gap-6 justify-center lg:justify-start">
                {[
                  { n: t.free.s1n, l: t.free.s1l, Icon: IconGift },
                  { n: t.free.s2n, l: t.free.s2l, Icon: IconBook },
                  { n: t.free.s3n, l: t.free.s3l, Icon: IconStar },
                ].map(({ n, l, Icon }) => (
                  <div key={l} className="flex flex-col items-center lg:items-start gap-0.5">
                    <div className="flex items-center gap-1.5">
                      <Icon size={13} className="text-gold-light" />
                      <span className="font-display text-xl text-gold-light">{n}</span>
                    </div>
                    <span className="text-xs text-white/60 uppercase tracking-wide">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Character */}
            <div className="relative flex-shrink-0 h-72 w-56 sm:h-80 sm:w-64">
              <Image
                src="/yuji.png"
                alt="Manga character"
                fill
                className="object-contain object-bottom drop-shadow-2xl animate-float"
              />
            </div>
          </div>
        </div>

        {/* Bottom ticker */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-ink/20 overflow-hidden flex items-center">
          <div className="ticker-inner flex gap-12 whitespace-nowrap text-white/60 text-xs font-bold uppercase tracking-widest" style={{ animationDirection: "reverse" }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rotate-45 bg-white/40 inline-block" />
                New Chapters Daily
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconStar({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size ?? 20} height={size ?? 20} viewBox="0 0 24 24" fill="currentColor" stroke="none" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
