"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { IconFlame, IconStar, IconSparkles } from "./Icons";

const CHARACTER_IMAGES = [
  { src: "/yuji.png",    alt: "Yuji",             accent: "#a855f7", bg: "bg-purple-950/60 dark:bg-[#1A0A2E]", border: "border-purple-700/50 dark:border-purple-800/60", manga: "Jujutsu Kaisen", TagIcon: IconFlame    },
  { src: "/luffy.png",   alt: "Luffy",             accent: "#7c3aed", bg: "bg-violet-950/60 dark:bg-[#140A2A]", border: "border-violet-700/50 dark:border-violet-800/60", manga: "One Piece",        TagIcon: IconStar     },
  { src: "/tanjiro.png", alt: "Tanjiro & Nezuko",  accent: "#9333ea", bg: "bg-fuchsia-950/60 dark:bg-[#1A0825]", border: "border-fuchsia-700/50 dark:border-fuchsia-800/60", manga: "Demon Slayer",  TagIcon: IconSparkles },
];

export default function CharacterShowcase() {
  const { t } = useLanguage();
  const [hovered, setHovered] = useState<number | null>(null);

  const chars = t.chars.list.map((c, i) => ({ ...c, ...CHARACTER_IMAGES[i] }));

  return (
    <section id="characters" className="py-20 md:py-28 bg-[#0c0918] relative overflow-hidden">
      <div className="absolute inset-0 halftone opacity-50 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-saffron/5 dark:bg-saffron/3 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-saffron dark:text-saffron-bright uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-2">
            <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
            {t.chars.eyebrow}
            <span className="w-6 h-px bg-saffron dark:bg-saffron-bright" />
          </p>
          <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider mb-4">
            {t.chars.h1}{" "}
            <span className="gradient-text">{t.chars.h2}</span>
          </h2>
          <p className="text-ink/60 dark:text-cream/60 text-base max-w-xl mx-auto leading-relaxed">
            {t.chars.sub}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {chars.map((char, i) => {
            const TagIcon = char.TagIcon;
            return (
              <div
                key={char.alt}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                className={`relative rounded-2xl overflow-hidden border-2 ${char.border} ${char.bg} p-6 flex flex-col gap-4 transition-all duration-300 cursor-pointer ${
                  hovered === i ? "scale-[1.03] shadow-2xl" : hovered !== null ? "scale-[0.98] opacity-80" : ""
                }`}
                style={{ boxShadow: hovered === i ? `0 25px 60px ${char.accent}30, 0 8px 30px ${char.accent}20` : undefined }}
              >
                <span className="self-start flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 text-ink dark:text-cream border border-ink/10 dark:border-white/10">
                  <TagIcon size={12} />
                  {char.tag}
                </span>

                <div className="relative h-64 sm:h-72 w-full">
                  <Image
                    src={char.src}
                    alt={char.alt}
                    fill
                    className={`object-contain object-bottom drop-shadow-xl transition-transform duration-500 ${hovered === i ? "scale-110" : "animate-float"}`}
                    style={{ animationDelay: `${i * 0.8}s` }}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div>
                    <h3 className="font-display text-3xl tracking-wider text-ink dark:text-cream">{char.alt}</h3>
                    <p className="text-sm font-bold" style={{ color: char.accent }}>{char.title}</p>
                  </div>
                  <p className="text-xs text-ink/60 dark:text-cream/60 leading-relaxed">{char.desc}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-ink/10 dark:border-white/10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-ink/40 dark:text-cream/40 uppercase tracking-wider">{t.chars.mangaLabel}</span>
                      <span className="text-xs font-semibold text-ink/70 dark:text-cream/70">{char.manga}</span>
                    </div>
                    <button
                      className="px-4 py-1.5 rounded-full text-white text-xs font-bold transition-all hover:scale-105 active:scale-95"
                      style={{ background: char.accent }}
                    >
                      {t.chars.readNow}
                    </button>
                  </div>
                </div>

                {hovered === i && (
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 30%, ${char.accent}, transparent 70%)` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
