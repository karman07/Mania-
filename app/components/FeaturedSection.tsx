"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { IconFlame } from "./Icons";
import { getFeaturedManga } from "@/app/lib/api";
import type { MangaListItem } from "@/app/lib/types";

const FILTER_GENRES = ["all", "Action", "Romance", "Fantasy", "free", "Historical"] as const;

// ─── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[2/3] rounded-xl bg-ink/10 dark:bg-cream/10" />
      <div className="h-3 w-3/4 rounded bg-ink/10 dark:bg-cream/10" />
      <div className="h-3 w-1/2 rounded bg-ink/10 dark:bg-cream/10" />
    </div>
  );
}

// ─── Live manga card ───────────────────────────────────────────────────────────
function FeaturedCard({ manga }: { manga: MangaListItem }) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const creator = typeof manga.creatorId === "object" ? manga.creatorId : null;
  const authorName = creator?.penName ?? "Unknown";

  const coverUrl = manga.coverImage
    ? `${API}${manga.coverImage}`
    : null;

  const gradientStyle = {
    background: `linear-gradient(135deg, ${manga.gradientFrom}, ${manga.gradientTo})`,
  };

  const BADGE_COLORS: Record<string, string> = {
    HOT: "bg-red-500",
    NEW: "bg-emerald-500",
    TOP: "bg-saffron",
  };

  return (
    <Link
      href={`/manga/${manga._id}`}
      className="group relative flex flex-col card-hover cursor-pointer"
    >
      <div
        className="relative rounded-xl overflow-hidden aspect-[2/3] manga-border flex items-end justify-start p-4"
        style={!coverUrl ? gradientStyle : undefined}
      >
        {/* Cover image */}
        {coverUrl && (
          <img
            src={coverUrl}
            alt={manga.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Halftone overlay */}
        <div className="absolute inset-0 halftone opacity-40 pointer-events-none" />

        {/* Chapter count watermark (when no cover) */}
        {!coverUrl && (
          <span className="absolute inset-0 flex items-center justify-center font-display text-[7rem] leading-none opacity-10 select-none pointer-events-none text-white">
            {manga.chapterCount}
          </span>
        )}

        {/* Gradient scrim for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        {/* Badges */}
        <div className="relative z-10 flex flex-col gap-1.5">
          {manga.isFree && (
            <span className="self-start px-2.5 py-0.5 rounded bg-jade text-white text-xs font-black uppercase tracking-wider rotate-[-2deg] manga-border">
              FREE
            </span>
          )}
          {manga.badge && (
            <span
              className={`self-start px-2 py-0.5 rounded text-white text-xs font-bold ${
                BADGE_COLORS[manga.badge] ?? "bg-saffron"
              }`}
            >
              {manga.badge}
            </span>
          )}
        </div>

        {/* Origin flag */}
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow text-xs font-bold text-white">
          {manga.origin === "Indian" ? "🇮🇳" : "🌐"}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/50 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 px-4 py-2 rounded-full bg-saffron text-white font-bold text-sm manga-border">
            Read Now
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 px-1 flex flex-col gap-1">
        <h3 className="font-bold text-sm text-ink dark:text-cream leading-snug line-clamp-2 group-hover:text-saffron dark:group-hover:text-saffron-bright transition-colors">
          {manga.title}
        </h3>
        <p className="text-xs text-ink/50 dark:text-cream/50">{authorName}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="px-2 py-0.5 rounded-full bg-saffron/10 dark:bg-saffron/15 text-saffron dark:text-saffron-bright text-[10px] font-semibold">
            {manga.genres[0] ?? "Manga"}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-gold text-xs">★</span>
            <span className="text-xs font-semibold text-ink/70 dark:text-cream/70">
              {manga.rating > 0 ? manga.rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-ink/40 dark:text-cream/40">
          {manga.chapterCount} ch.
        </p>
      </div>
    </Link>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function FeaturedSection() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState(0);
  const [allManga, setAllManga] = useState<MangaListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getFeaturedManga()
      .then((data) => {
        setAllManga(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? "Failed to load manga");
        setLoading(false);
      });
  }, []);

  const activeKey = FILTER_GENRES[activeFilter];

  const filtered =
    activeKey === "all"
      ? allManga
      : activeKey === "free"
      ? allManga.filter((m) => m.isFree)
      : allManga.filter((m) => m.genres.includes(activeKey));

  const browsePath =
    activeKey === "all"
      ? "/browse"
      : activeKey === "free"
      ? "/browse?free=true"
      : `/browse?genre=${encodeURIComponent(activeKey)}`;

  return (
    <section
      id="featured"
      className="py-20 md:py-28 bg-cream dark:bg-[#0C0818] relative overflow-hidden"
    >
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
          <Link
            href={browsePath}
            className="self-start sm:self-auto text-sm font-semibold text-saffron dark:text-saffron-bright hover:underline underline-offset-4"
          >
            {t.feat.viewAll}
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
          {t.feat.filters.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveFilter(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                i === activeFilter
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
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <p className="font-display text-3xl text-ink/30 dark:text-cream/30">
              Could not load manga
            </p>
            <p className="text-sm text-ink/40 dark:text-cream/40">{error}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 sm:gap-6">
            {filtered.map((m) => (
              <FeaturedCard key={m._id} manga={m} />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <p className="font-display text-3xl text-ink/30 dark:text-cream/30">
              No titles yet
            </p>
            <p className="text-sm text-ink/40 dark:text-cream/40">
              More coming soon in this genre
            </p>
          </div>
        )}

        {/* Browse all */}
        <div className="mt-12 flex justify-center">
          <Link
            href={browsePath}
            className="flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-saffron/40 dark:border-saffron-bright/30 text-saffron dark:text-saffron-bright font-semibold hover:bg-saffron/10 transition-all hover:scale-105 active:scale-95"
          >
            {t.feat.loadMore}
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19 9-7 7-7-7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
