"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getMyManga, updateMangaStatus } from "@/app/lib/api";
import type { MangaListItem, PublishedStatus } from "@/app/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const TABS: { label: string; value: PublishedStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Trashed", value: "trashed" },
];

const STATUS_COLORS: Record<PublishedStatus, string> = {
  published: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  trashed: "bg-red-500/15 text-red-500 border-red-500/30",
};

function MangaRow({ manga, onStatusChange }: { manga: MangaListItem; onStatusChange: (id: string, s: PublishedStatus) => void }) {
  const [changing, setChanging] = useState(false);
  const coverUrl = manga.coverImage ? `${API}${manga.coverImage}` : null;

  async function changeStatus(newStatus: PublishedStatus) {
    if (changing) return;
    setChanging(true);
    try {
      await updateMangaStatus(manga._id, newStatus);
      onStatusChange(manga._id, newStatus);
    } finally {
      setChanging(false);
    }
  }

  return (
    <div className="group flex items-center gap-4 px-5 py-4 rounded-2xl bg-white dark:bg-[#1A1130] border border-ink/8 dark:border-cream/8 hover:border-saffron/30 transition-all">
      {/* Cover */}
      <div className="w-12 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0 bg-saffron/10">
        {coverUrl ? (
          <Image src={coverUrl} alt={manga.title} width={48} height={72} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: `linear-gradient(135deg,${manga.gradientFrom},${manga.gradientTo})` }}
          >
            {manga.title.charAt(0)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-ink dark:text-cream truncate group-hover:text-saffron transition-colors">{manga.title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-0.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[manga.publishedStatus]}`}>
            {manga.publishedStatus}
          </span>
          <span className="text-xs text-ink/35 dark:text-cream/35">{manga.chapterCount} ch</span>
          <span className="text-xs text-ink/35 dark:text-cream/35">·</span>
          <span className="text-xs text-ink/35 dark:text-cream/35">{manga.viewCount.toLocaleString()} views</span>
          <span className="text-xs text-ink/35 dark:text-cream/35">·</span>
          <span className="text-xs text-ink/35 dark:text-cream/35">★ {manga.rating > 0 ? manga.rating.toFixed(1) : "New"}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={`/creator/studio/manga/${manga._id}`}
          id={`manage-${manga._id}`}
          className="text-xs px-3 py-1.5 rounded-lg bg-saffron/10 text-saffron font-semibold hover:bg-saffron/20 transition-colors"
        >
          Manage
        </Link>
        {manga.publishedStatus !== "published" && (
          <button
            onClick={() => changeStatus("published")}
            disabled={changing}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
          >
            Publish
          </button>
        )}
        {manga.publishedStatus === "published" && (
          <button
            onClick={() => changeStatus("draft")}
            disabled={changing}
            className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-40"
          >
            Unpublish
          </button>
        )}
        {manga.publishedStatus !== "trashed" && (
          <button
            onClick={() => changeStatus("trashed")}
            disabled={changing}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-40"
          >
            Trash
          </button>
        )}
        {manga.publishedStatus === "trashed" && (
          <button
            onClick={() => changeStatus("draft")}
            disabled={changing}
            className="text-xs px-3 py-1.5 rounded-lg bg-ink/10 dark:bg-cream/10 text-ink/60 dark:text-cream/60 font-semibold hover:bg-ink/20 transition-colors disabled:opacity-40"
          >
            Restore
          </button>
        )}
      </div>
    </div>
  );
}

export default function MyMangaPage() {
  const [tab, setTab] = useState<PublishedStatus | "all">("all");
  const [manga, setManga] = useState<MangaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getMyManga(tab === "all" ? undefined : tab)
      .then(setManga)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  function handleStatusChange(id: string, newStatus: PublishedStatus) {
    if (tab === "all") {
      setManga((prev) => prev.map((m) => m._id === id ? { ...m, publishedStatus: newStatus, isPublished: newStatus === "published" } : m));
    } else {
      setManga((prev) => prev.filter((m) => m._id !== id));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl text-ink dark:text-cream tracking-wider">My <span className="gradient-text">Manga</span></h1>
          <p className="text-sm text-ink/45 dark:text-cream/45 mt-1">Manage all your series and chapters</p>
        </div>
        <Link
          href="/creator/studio/create"
          id="create-new-btn"
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-saffron text-white font-bold text-sm hover:bg-saffron/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-saffron/25"
        >
          <span>✦</span> Create New
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-ink/5 dark:bg-cream/5 w-fit">
        {TABS.map(({ label, value }) => (
          <button
            key={value}
            id={`tab-${value}`}
            onClick={() => setTab(value)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === value
                ? "bg-white dark:bg-[#1A1130] text-saffron shadow"
                : "text-ink/50 dark:text-cream/50 hover:text-saffron"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Manga list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-ink/5 dark:bg-cream/5 animate-pulse" />
          ))}
        </div>
      ) : manga.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border-2 border-dashed border-ink/10 dark:border-cream/10">
          <p className="font-display text-3xl text-ink/20 dark:text-cream/20">
            {tab === "all" ? "No manga yet" : `No ${tab} manga`}
          </p>
          <p className="text-sm text-ink/30 dark:text-cream/30 mt-2 mb-6">
            {tab === "all" ? "Start creating your first series!" : `Switch to another tab or create a new series.`}
          </p>
          <Link
            href="/creator/studio/create"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-saffron text-white font-bold text-sm hover:bg-saffron/90 transition-all"
          >
            ✦ Create New Manga
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {manga.map((m) => (
            <MangaRow key={m._id} manga={m} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
