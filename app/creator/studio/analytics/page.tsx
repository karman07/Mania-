"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getMyManga, getMangaAnalytics } from "@/app/lib/api";
import type { MangaListItem, MangaAnalytics } from "@/app/lib/types";
import ViewsChart from "@/app/components/ViewsChart";
import BarChart from "@/app/components/BarChart";

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const [mangaList, setMangaList] = useState<MangaListItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [analytics, setAnalytics] = useState<MangaAnalytics | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load manga list
  useEffect(() => {
    getMyManga()
      .then((list) => {
        setMangaList(list);
        const fromQuery = searchParams.get("manga");
        const first = fromQuery && list.find((m) => m._id === fromQuery) ? fromQuery : list[0]?._id ?? "";
        setSelectedId(first);
      })
      .catch(() => {})
      .finally(() => setLoadingList(false));
  }, []);

  // Load analytics when selection changes
  useEffect(() => {
    if (!selectedId) return;
    setLoadingStats(true);
    setAnalytics(null);
    getMangaAnalytics(selectedId)
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [selectedId]);

  const selected = mangaList.find((m) => m._id === selectedId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl text-ink dark:text-cream tracking-wider">
            <span className="gradient-text">Analytics</span>
          </h1>
          <p className="text-sm text-ink/45 dark:text-cream/45 mt-1">Deep dive into your manga performance</p>
        </div>

        {/* Manga selector */}
        {!loadingList && mangaList.length > 0 && (
          <select
            id="analytics-manga-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1A1A] px-4 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50 min-w-[200px]"
          >
            {mangaList.map((m) => (
              <option key={m._id} value={m._id}>{m.title}</option>
            ))}
          </select>
        )}
      </div>

      {loadingList ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl bg-ink/5 dark:bg-cream/5 animate-pulse" />)}
        </div>
      ) : mangaList.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border-2 border-dashed border-ink/10 dark:border-cream/10">
          <p className="font-display text-2xl text-ink/20 dark:text-cream/20">No manga yet</p>
          <Link href="/creator/studio/create" className="text-saffron text-sm mt-4 inline-block">Create your first series →</Link>
        </div>
      ) : (
        <>
          {/* Top stats */}
          {analytics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Views", value: analytics.totalViews.toLocaleString(), accent: true },
                { label: "Rating", value: analytics.rating > 0 ? `★ ${analytics.rating.toFixed(1)}` : "★ New" },
                { label: "Ratings Count", value: analytics.ratingCount.toLocaleString() },
                { label: "Chapters", value: analytics.chapterCount },
              ].map(({ label, value, accent }) => (
                <div key={label} className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-5">
                  <span className="text-xs font-bold uppercase tracking-widest text-ink/35 dark:text-cream/35 block mb-1">{label}</span>
                  <span className={`font-display text-3xl tracking-wider ${accent ? "gradient-text" : "text-ink dark:text-cream"}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Ranking card */}
          {analytics && selected && (
            <div className="rounded-2xl bg-gradient-to-br from-saffron/10 to-gold/5 border border-saffron/20 p-5 flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-saffron/20 flex items-center justify-center text-2xl">📊</div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-saffron/70 mb-1">Performance</p>
                <p className="font-bold text-ink dark:text-cream">
                  <span className="font-display text-2xl text-saffron">{analytics.totalViews.toLocaleString()}</span>
                  <span className="text-sm text-ink/50 dark:text-cream/50 ml-2">total views on "{analytics.title}"</span>
                </p>
                <p className="text-xs text-ink/40 dark:text-cream/40 mt-0.5">
                  avg {analytics.chapterCount > 0 ? Math.round(analytics.totalViews / analytics.chapterCount).toLocaleString() : 0} views/chapter
                </p>
              </div>
            </div>
          )}

          {/* Views over time */}
          {loadingStats ? (
            <div className="h-48 rounded-2xl bg-ink/5 dark:bg-cream/5 animate-pulse" />
          ) : analytics && analytics.viewsOverTime.length > 0 ? (
            <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-6">
              <h2 className="font-bold text-base text-ink dark:text-cream mb-4">Views Over Time (30 days)</h2>
              <ViewsChart data={analytics.viewsOverTime} height={180} />
            </div>
          ) : null}

          {/* Chapter performance */}
          {analytics && analytics.chapters.length > 0 && (
            <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-6">
              <h2 className="font-bold text-base text-ink dark:text-cream mb-4">Views per Chapter</h2>
              <BarChart data={analytics.chapters} height={200} />

              {/* Chapter table */}
              <div className="mt-6 divide-y divide-ink/5 dark:divide-cream/5">
                {analytics.chapters
                  .slice()
                  .sort((a, b) => b.views - a.views)
                  .map((ch, i) => (
                  <div key={ch.chapterNumber} className="flex items-center gap-4 py-3">
                    <span className="font-display text-xl text-saffron/30 w-6 text-right flex-shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink dark:text-cream">{ch.title || `Chapter ${ch.chapterNumber}`}</p>
                      <p className="text-xs text-ink/35 dark:text-cream/35">{ch.pageCount} pages · {new Date(ch.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-ink/70 dark:text-cream/70">{ch.views.toLocaleString()}</p>
                      <p className="text-[10px] text-ink/30 dark:text-cream/30">views</p>
                    </div>
                    {/* Mini bar */}
                    <div className="w-24 h-2 rounded-full bg-ink/8 dark:bg-cream/8 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-saffron rounded-full"
                        style={{ width: `${analytics.chapters.length > 0 ? (ch.views / Math.max(...analytics.chapters.map(c => c.views), 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
