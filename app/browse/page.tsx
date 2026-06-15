"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/components/AuthProvider";
import {
  IconSearch, IconStar, IconFlame, IconBook,
  IconSword, IconHeart, IconWand, IconShield,
  IconSmile, IconCoffee, IconSparkles, IconLandmark,
  IconChevronDown, IconArrowRight,
} from "@/app/components/Icons";
import { getManga } from "@/app/lib/api";
import type { MangaListItem, PaginatedManga } from "@/app/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRES = [
  "All", "Action", "Romance", "Fantasy", "Horror",
  "Comedy", "Slice of Life", "Sci-Fi", "Historical",
];

const GENRE_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Action: IconSword, Romance: IconHeart, Fantasy: IconWand, Horror: IconShield,
  Comedy: IconSmile, "Slice of Life": IconCoffee, "Sci-Fi": IconSparkles, Historical: IconLandmark,
};

const SORT_OPTIONS = ["Popular", "Latest", "Top Rated", "Free First"];

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="w-full aspect-[2/3] rounded-2xl bg-ink/10 dark:bg-cream/10" />
      <div className="h-3 w-3/4 rounded bg-ink/10 dark:bg-cream/10" />
      <div className="h-3 w-1/2 rounded bg-ink/10 dark:bg-cream/10" />
    </div>
  );
}

// ─── Manga card ───────────────────────────────────────────────────────────────

function MangaCard({ m }: { m: MangaListItem }) {
  const creator = typeof m.creatorId === "object" ? m.creatorId : null;
  const authorName = creator?.penName ?? "Unknown Author";
  const coverUrl = m.coverImage ? `${API}${m.coverImage}` : null;

  const BADGE_STYLE: Record<string, string> = {
    HOT: "bg-red-500 text-white",
    NEW: "bg-emerald-500 text-white",
    TOP: "bg-saffron text-white",
  };

  return (
    <Link href={`/manga/${m._id}`} className="group flex flex-col gap-2 cursor-pointer">
      {/* cover */}
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={m.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${m.gradientFrom}, ${m.gradientTo})`,
            }}
          />
        )}

        {/* halftone overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* title watermark on gradient cards */}
        {!coverUrl && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <p className="font-display text-white text-sm tracking-wide leading-tight line-clamp-2">
              {m.title}
            </p>
          </div>
        )}

        {/* badge */}
        {m.badge && (
          <span
            className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              BADGE_STYLE[m.badge] ?? "bg-saffron text-white"
            }`}
          >
            {m.badge}
          </span>
        )}
        {m.isFree && !m.badge && (
          <span className="absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500 text-white">
            FREE
          </span>
        )}

        {/* hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-1.5 bg-saffron text-white text-xs font-bold px-4 py-2 rounded-full translate-y-2 group-hover:translate-y-0">
            <IconBook size={12} />
            Read Now
          </span>
        </div>
      </div>

      {/* meta */}
      <div>
        <p className="text-sm font-semibold text-ink dark:text-cream line-clamp-1 group-hover:text-saffron transition-colors">
          {m.title}
        </p>
        <p className="text-xs text-ink/40 dark:text-cream/40 mt-0.5 line-clamp-1">
          {authorName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="flex items-center gap-0.5 text-xs text-amber-500">
            <IconStar size={11} filled />
            <span className="font-semibold text-ink/70 dark:text-cream/60">
              {m.rating > 0 ? m.rating.toFixed(1) : "New"}
            </span>
          </span>
          <span className="text-[10px] text-ink/30 dark:text-cream/30">·</span>
          <span className="text-xs text-ink/40 dark:text-cream/40">
            {m.chapterCount} ch
          </span>
          <span className="text-[10px] text-ink/30 dark:text-cream/30">·</span>
          <span
            className={`text-[10px] font-medium ${
              m.status === "completed" ? "text-emerald-500" : "text-saffron"
            }`}
          >
            {m.status === "completed" ? "Done" : m.status === "hiatus" ? "Hiatus" : "Ongoing"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Browse content ───────────────────────────────────────────────────────────

function BrowseContent() {
  const { user, openDialog } = useAuth();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [genre, setGenre] = useState(() => {
    const g = searchParams.get("genre") ?? "";
    return GENRES.includes(g) ? g : "All";
  });
  const [sort, setSort] = useState(() => {
    const s = searchParams.get("sort") ?? "";
    return SORT_OPTIONS.includes(s) ? s : "Popular";
  });
  const [freeOnly, setFreeOnly] = useState(
    () => searchParams.get("free") === "true"
  );
  const [sortOpen, setSortOpen] = useState(false);

  const [data, setData] = useState<PaginatedManga | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // ─── Fetch on filter change ─────────────────────────────────────────────────

  const fetchManga = useCallback(
    async (pageNum: number, append = false) => {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      setError(null);
      try {
        const result = await getManga({
          genre: genre !== "All" ? genre : undefined,
          free: freeOnly || undefined,
          search: search.trim() || undefined,
          sort,
          page: pageNum,
          limit: 24,
        });
        setData((prev) =>
          append && prev
            ? { ...result, data: [...prev.data, ...result.data] }
            : result
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load manga");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [genre, freeOnly, search, sort]
  );

  // Reset and refetch when filters change
  useEffect(() => {
    setPage(1);
    fetchManga(1, false);
  }, [genre, freeOnly, sort]); // intentionally excludes search (debounced below)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchManga(1, false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchManga(next, true);
  };

  const greetName = user?.displayName?.split(" ")[0] ?? null;
  const totalCount = data?.total ?? 0;
  const hasMore = data ? data.page < data.pages : false;

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0C0818]">
      <Navbar />

      {/* ── page header ── */}
      <div className="pt-20 border-b border-saffron/10 dark:border-cream/5 bg-cream dark:bg-[#0C0818]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {greetName && (
            <p className="text-xs font-semibold text-saffron uppercase tracking-[0.2em] mb-2">
              Welcome back, {greetName} 👋
            </p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-5xl sm:text-6xl text-ink dark:text-cream tracking-wider">
                Browse <span className="gradient-text">Manga</span>
              </h1>
              <p className="text-sm text-ink/50 dark:text-cream/40 mt-2">
                {loading ? "Loading…" : `${totalCount.toLocaleString()} titles`} · Updated daily
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFreeOnly((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-xs font-bold transition-all ${
                  freeOnly
                    ? "border-saffron bg-saffron text-white"
                    : "border-ink/15 dark:border-cream/15 text-ink/60 dark:text-cream/50 hover:border-saffron/50"
                }`}
              >
                <IconBook size={12} />
                Free Only
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── search + sort bar ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          <div className="relative flex-1">
            <IconSearch
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/30 dark:text-cream/30"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles, authors…"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/50 transition-colors"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-sm font-medium text-ink/70 dark:text-cream/60 hover:border-saffron/40 transition-colors whitespace-nowrap"
            >
              <IconFlame size={14} className="text-saffron" />
              {sort}
              <IconChevronDown
                size={14}
                className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute top-full right-0 mt-2 w-44 rounded-2xl border-2 border-saffron/15 bg-cream dark:bg-[#120D22] shadow-xl overflow-hidden z-20">
                {SORT_OPTIONS.map((o) => (
                  <button
                    key={o}
                    onClick={() => { setSort(o); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      sort === o
                        ? "bg-saffron/10 text-saffron font-semibold"
                        : "text-ink/70 dark:text-cream/60 hover:bg-saffron/8"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── genre tabs ── */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {GENRES.map((g) => {
            const Icon = GENRE_ICONS[g];
            const active = genre === g;
            return (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
                  active
                    ? "border-saffron bg-saffron text-white"
                    : "border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink/60 dark:text-cream/50 hover:border-saffron/40 hover:text-saffron"
                }`}
              >
                {Icon && <Icon size={12} />}
                {g}
              </button>
            );
          })}
        </div>

        {/* ── results count ── */}
        {!loading && (
          <p className="text-xs text-ink/40 dark:text-cream/35 mb-5">
            {totalCount} {totalCount === 1 ? "title" : "titles"}
            {genre !== "All" ? ` in ${genre}` : ""}
            {freeOnly ? " · free only" : ""}
            {search ? ` matching "${search}"` : ""}
          </p>
        )}

        {/* ── grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
            {Array.from({ length: 24 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink/20 dark:text-cream/20 tracking-wider mb-2">
              Could not load manga
            </p>
            <p className="text-sm text-ink/30 dark:text-cream/30">{error}</p>
            <button
              onClick={() => fetchManga(1, false)}
              className="mt-6 px-6 py-2.5 rounded-full border-2 border-saffron/40 text-saffron font-semibold text-sm hover:bg-saffron hover:text-white transition-all"
            >
              Try again
            </button>
          </div>
        ) : !data?.data.length ? (
          <div className="py-24 text-center">
            <p className="font-display text-3xl text-ink/20 dark:text-cream/20 tracking-wider mb-2">
              No manga found
            </p>
            <p className="text-sm text-ink/30 dark:text-cream/30">
              Try a different search or filter
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-7">
              {data.data.map((m) => (
                <MangaCard key={m._id} m={m} />
              ))}
            </div>

            {/* load more */}
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-saffron/30 text-saffron font-semibold text-sm hover:bg-saffron hover:text-white hover:border-saffron transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                  {!loadingMore && <IconArrowRight size={14} />}
                </button>
                <p className="text-xs text-ink/30 dark:text-cream/30 mt-3">
                  Showing {data.data.length} of {totalCount}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── sign-up nudge for guests ── */}
      {!user && (
        <div className="mt-4 mb-12 mx-4 sm:mx-6 lg:mx-8 max-w-7xl lg:mx-auto">
          <div className="rounded-3xl ink-bg p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="relative z-10">
              <p className="font-display text-3xl text-white tracking-wider">
                Unlock the full library
              </p>
              <p className="text-white/60 text-sm mt-1">
                Create a free account to bookmark, track and read exclusive chapters.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0 relative z-10">
              <button
                onClick={openDialog}
                className="px-6 py-3 rounded-full bg-white text-saffron font-bold text-sm hover:bg-cream transition-all manga-border"
              >
                Sign Up Free
              </button>
              <a
                href="#featured"
                className="px-6 py-3 rounded-full border-2 border-white/40 text-white font-semibold text-sm hover:border-white/70 transition-all"
              >
                Maybe later
              </a>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowseContent />
    </Suspense>
  );
}
