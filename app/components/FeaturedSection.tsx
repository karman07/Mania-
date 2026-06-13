"use client";

import { useLanguage } from "./LanguageProvider";
import MangaCard, { type MangaItem } from "./MangaCard";
import { IconFlame } from "./Icons";

const MANGA: MangaItem[] = [
  { title: "Karma Warriors",         author: "Arjun Sharma",   genre: "Action",       rating: 4.9, chapters: 68,  free: true,  gradient: "bg-gradient-to-br from-orange-400 via-red-500 to-rose-700",    accent: "#E8521A", tag: "Hot",          origin: "Indian"        },
  { title: "Sacred Blade of Ashoka", author: "Priya Nair",     genre: "Historical",   rating: 4.8, chapters: 112, free: false, gradient: "bg-gradient-to-br from-yellow-500 via-amber-600 to-orange-700", accent: "#C4922A", tag: "New",          origin: "Indian"        },
  { title: "Chai Chronicles",        author: "Meera Patel",    genre: "Slice of Life",rating: 4.6, chapters: 34,  free: true,  gradient: "bg-gradient-to-br from-amber-500 via-amber-700 to-yellow-800",  accent: "#B45309",                      origin: "Indian"        },
  { title: "Devi's Wrath",           author: "Kiran Das",      genre: "Supernatural", rating: 4.9, chapters: 85,  free: false, gradient: "bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-800", accent: "#7C3AED", tag: "Top Rated",   origin: "Indian"        },
  { title: "Dragon's Path",          author: "Hana Mori",      genre: "Fantasy",      rating: 4.7, chapters: 200, free: true,  gradient: "bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700",   accent: "#0D9488", tag: "Global",      origin: "International" },
  { title: "Sakura Storm",           author: "Yuki Tanaka",    genre: "Romance",      rating: 4.5, chapters: 60,  free: true,  gradient: "bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600",   accent: "#E11D48",                      origin: "International" },
  { title: "Maharaja Rising",        author: "Rahul Verma",    genre: "Action",       rating: 4.8, chapters: 92,  free: false, gradient: "bg-gradient-to-br from-yellow-600 via-orange-600 to-red-700",   accent: "#D97706", tag: "Award Winner", origin: "Indian"        },
  { title: "The Mughal Avenger",     author: "Farhan Qureshi", genre: "Historical",   rating: 4.7, chapters: 143, free: false, gradient: "bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800",  accent: "#4F46E5",                      origin: "Indian"        },
];

export default function FeaturedSection() {
  const { t } = useLanguage();

  return (
    <section id="featured" className="py-20 md:py-28 bg-cream dark:bg-[#0C0818] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gold/8 dark:bg-gold/4 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold text-saffron dark:text-saffron-bright uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
              <span className="w-4 h-px bg-saffron dark:bg-saffron-bright inline-block" />
              {t.feat.eyebrow}
            </p>
            <h2 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider">
              <span className="gradient-text">{t.feat.heading}</span>
            </h2>
          </div>
          <a href="#" className="self-start sm:self-auto text-sm font-semibold text-saffron dark:text-saffron-bright hover:underline underline-offset-4">
            {t.feat.viewAll}
          </a>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {t.feat.filters.map((tab, i) => (
            <button
              key={i}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                i === 0
                  ? "bg-saffron text-white manga-border"
                  : "bg-parchment dark:bg-[#1A1130] text-ink/70 dark:text-cream/70 border border-saffron/20 dark:border-saffron/15 hover:border-saffron dark:hover:border-saffron-bright hover:text-saffron dark:hover:text-saffron-bright"
              }`}
            >
              {i === 0 && <IconFlame size={13} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
          {MANGA.map((m) => (
            <MangaCard key={m.title} manga={m} readNow={t.feat.readNow} />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-saffron/40 dark:border-saffron-bright/30 text-saffron dark:text-saffron-bright font-semibold hover:bg-saffron/10 transition-all hover:scale-105 active:scale-95">
            {t.feat.loadMore}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
