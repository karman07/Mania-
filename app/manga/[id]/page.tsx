"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getMangaDetail, getMangaChapters, incrementMangaView, getMyRating } from "@/app/lib/api";
import type { MangaDetail, ChapterListItem } from "@/app/lib/types";
import StarRating from "@/app/components/StarRating";
import CommentsSection from "@/app/components/CommentsSection";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded bg-ink/10 dark:bg-cream/10 ${className}`} />
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ongoing: "bg-saffron/15 text-saffron border border-saffron/30",
    completed: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
    hiatus: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
  };
  const labels: Record<string, string> = {
    ongoing: "Ongoing", completed: "Completed", hiatus: "Hiatus",
  };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${colors[status] ?? colors.ongoing}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function MangaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [chapters, setChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getMangaDetail(id), getMangaChapters(id)])
      .then(([m, chs]) => {
        setManga(m);
        setChapters(chs);
        incrementMangaView(id).catch(() => null);
        // Fetch user's existing rating (non-blocking)
        getMyRating(id).then((score) => setUserRating(score)).catch(() => null);
      })
      .catch((err) => setError(err.message ?? "Not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const creator = manga?.creatorId;
  const coverUrl = manga?.coverImage ? `${API}${manga.coverImage}` : null;

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
          <div className="flex flex-col md:flex-row gap-10">
            <Skeleton className="w-full md:w-64 aspect-[2/3] flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-4 pt-2">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────

  if (error || !manga) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0A0A0A] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <p className="font-display text-4xl text-ink/20 dark:text-cream/20">
            Manga not found
          </p>
          <p className="text-ink/40 dark:text-cream/40 text-sm">{error}</p>
          <Link
            href="/browse"
            className="px-6 py-3 rounded-full bg-saffron text-white font-semibold text-sm hover:bg-saffron/90 transition-all"
          >
            Browse manga
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0A0A0A]">
      <Navbar />

      {/* ── Hero banner ── */}
      <div
        className="relative pt-20 pb-0 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${manga.gradientFrom}33, ${manga.gradientTo}33)`,
        }}
      >
        {/* blurred background */}
        {coverUrl && (
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center blur-2xl scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${coverUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-cream/80 dark:bg-[#0A0A0A]/85 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">

            {/* Cover */}
            <div className="flex-shrink-0 w-48 sm:w-56 md:w-64">
              <div
                className="w-full aspect-[2/3] rounded-2xl overflow-hidden manga-border shadow-2xl"
                style={
                  !coverUrl
                    ? { background: `linear-gradient(135deg, ${manga.gradientFrom}, ${manga.gradientTo})` }
                    : undefined
                }
              >
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={manga.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display text-6xl text-white/20">
                      {manga.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={manga.status} />
                {manga.isFree && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-jade/15 text-jade border border-jade/30">
                    FREE
                  </span>
                )}
                {manga.badge && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                    {manga.badge}
                  </span>
                )}
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-ink/10 dark:bg-cream/10 text-ink/60 dark:text-cream/60">
                  {manga.origin}
                </span>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-ink/10 dark:bg-cream/10 text-ink/60 dark:text-cream/60">
                  {manga.ageRating === "all" ? "All Ages" : manga.ageRating === "teen" ? "Teen" : "Mature"}
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl text-ink dark:text-cream tracking-wider leading-tight">
                {manga.title}
              </h1>

              {/* Creator */}
              {creator && (
                <Link
                  href={`/creator/${creator._id}`}
                  className="flex items-center gap-3 w-fit group"
                >
                  {creator.photoURL ? (
                    <img
                      src={creator.photoURL}
                      alt={creator.penName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-saffron/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-saffron/20 flex items-center justify-center text-xs font-bold text-saffron">
                      {creator.penName.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-semibold text-ink/70 dark:text-cream/70 group-hover:text-saffron transition-colors">
                    {creator.penName}
                  </span>
                </Link>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-5">
                {[
                  { label: "Rating", value: manga.rating > 0 ? `★ ${manga.rating.toFixed(1)}` : "★ New" },
                  { label: "Chapters", value: manga.chapterCount },
                  { label: "Views", value: manga.viewCount.toLocaleString() },
                  { label: "Language", value: manga.language },
                ].map(({ label, value }) => (
                  <div key={label} className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream/40 font-semibold">
                      {label}
                    </span>
                    <span className="text-base font-bold text-ink dark:text-cream">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {manga.genres.map((g) => (
                  <Link
                    key={g}
                    href={`/browse?genre=${encodeURIComponent(g)}`}
                    className="text-xs px-3 py-1 rounded-full bg-saffron/10 dark:bg-saffron/15 text-saffron dark:text-saffron-bright font-semibold hover:bg-saffron/20 transition-colors"
                  >
                    {g}
                  </Link>
                ))}
                {manga.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-ink/8 dark:bg-cream/8 text-ink/60 dark:text-cream/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-sm text-ink/70 dark:text-cream/60 leading-relaxed max-w-2xl">
                {manga.description}
              </p>

              {/* Rating */}
              <div className="mt-1">
                <p className="text-[10px] uppercase tracking-widest text-ink/40 dark:text-cream/40 font-semibold mb-2">Rate this manga</p>
                <StarRating
                  mangaId={id}
                  initialRating={manga.rating}
                  ratingCount={manga.ratingCount}
                  userInitialScore={userRating}
                  onRated={(newRating, count) =>
                    setManga((m) => m ? { ...m, rating: newRating, ratingCount: count } : m)
                  }
                />
              </div>

              {/* CTA */}
              {chapters.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  <Link
                    href={`/manga/${id}/chapter/1`}
                    className="px-8 py-3 rounded-full bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all hover:scale-105 active:scale-95"
                  >
                    Start Reading →
                  </Link>
                  <Link
                    href={`/manga/${id}/chapter/${chapters.at(-1)!.chapterNumber}`}
                    className="px-8 py-3 rounded-full border-2 border-saffron/40 text-saffron font-semibold text-sm hover:bg-saffron/10 transition-all"
                  >
                    Latest Chapter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Chapter list ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-display text-3xl text-ink dark:text-cream tracking-wider mb-6">
          Chapters{" "}
          <span className="text-saffron">({chapters.length})</span>
        </h2>

        {chapters.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border-2 border-dashed border-ink/10 dark:border-cream/10">
            <p className="font-display text-2xl text-ink/20 dark:text-cream/20">
              No chapters yet
            </p>
            <p className="text-sm text-ink/30 dark:text-cream/30 mt-1">
              Check back soon!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {chapters.map((ch) => (
              <Link
                key={ch._id}
                href={`/manga/${id}/chapter/${ch.chapterNumber}`}
                className="group flex items-center justify-between px-5 py-4 rounded-2xl border border-ink/8 dark:border-cream/8 bg-white dark:bg-white/3 hover:border-saffron/40 hover:bg-saffron/5 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-2xl text-saffron/40 dark:text-saffron/30 w-10 text-right flex-shrink-0">
                    {ch.chapterNumber}
                  </span>
                  <div>
                    <p className="font-semibold text-sm text-ink dark:text-cream group-hover:text-saffron transition-colors">
                      {ch.title || `Chapter ${ch.chapterNumber}`}
                    </p>
                    <p className="text-xs text-ink/40 dark:text-cream/40 mt-0.5">
                      {ch.pageCount} pages
                      {ch.viewCount > 0 && ` · ${ch.viewCount.toLocaleString()} views`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(ch.isFree ?? false) && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-jade/15 text-jade">
                      FREE
                    </span>
                  )}
                  <span className="text-xs text-ink/30 dark:text-cream/30">
                    {new Date(ch.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-saffron/40 group-hover:text-saffron transition-colors text-lg">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── Comments & Ratings Section ── */}
        <div className="mt-4 pt-4 border-t border-ink/8 dark:border-cream/8">
          <CommentsSection mangaId={id} title="Community Discussion" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
