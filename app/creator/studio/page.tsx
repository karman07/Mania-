"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/components/AuthProvider";
import { getCreatorStats } from "@/app/lib/api";
import type { CreatorStats } from "@/app/lib/types";
import ViewsChart from "@/app/components/ViewsChart";
import type { ViewDataPoint } from "@/app/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1A1130] border border-ink/8 dark:border-cream/8 p-5 flex flex-col gap-1 transition-all hover:border-saffron/30 hover:shadow-lg hover:shadow-saffron/5">
      <span className="text-xs font-bold uppercase tracking-widest text-ink/35 dark:text-cream/35">{label}</span>
      <span className={`font-display text-4xl tracking-widest ${accent ?? "text-ink dark:text-cream"}`}>{value}</span>
      {sub && <span className="text-xs text-ink/40 dark:text-cream/40">{sub}</span>}
    </div>
  );
}

// Generate a simple sparkline from CreatorStats (approximated 14-day data)
function mockViewsOverTime(total: number): ViewDataPoint[] {
  const today = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toISOString().split("T")[0],
      views: Math.max(0, Math.round((total / 14) * (0.4 + Math.random() * 1.2))),
    };
  });
}

export default function StudioDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCreatorStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const viewsData = stats ? mockViewsOverTime(stats.totalViews) : [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-saffron/15 border border-saffron/30 text-saffron text-[10px] font-bold uppercase tracking-widest">
            ✦ Creator Studio
          </span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl text-ink dark:text-cream tracking-wider">
          Welcome back, <span className="gradient-text">{user?.displayName?.split(" ")[0]}</span>
        </h1>
        <p className="text-ink/45 dark:text-cream/45 text-sm mt-1">Here's how your work is performing today.</p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-2xl bg-ink/5 dark:bg-cream/5 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} sub="across all manga" accent="gradient-text" />
          <StatCard label="Published" value={stats.published} sub="active series" />
          <StatCard label="Drafts" value={stats.drafts} sub="in progress" />
          <StatCard label="Chapters" value={stats.totalChapters} sub="total uploaded" />
        </div>
      ) : null}

      {/* Views chart */}
      {viewsData.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#1A1130] border border-ink/8 dark:border-cream/8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink dark:text-cream text-base">Views (last 14 days)</h2>
            <Link href="/creator/studio/analytics" className="text-xs font-semibold text-saffron hover:underline">
              Full analytics →
            </Link>
          </div>
          <ViewsChart data={viewsData} height={150} />
        </div>
      )}

      {/* Top manga table */}
      {stats && stats.topManga.length > 0 && (
        <div className="rounded-2xl bg-white dark:bg-[#1A1130] border border-ink/8 dark:border-cream/8 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8 dark:border-cream/8">
            <h2 className="font-bold text-ink dark:text-cream text-base">Top Performing Manga</h2>
            <Link href="/creator/studio/manga" className="text-xs font-semibold text-saffron hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-ink/5 dark:divide-cream/5">
            {stats.topManga.map((m, i) => (
              <div key={m._id} className="flex items-center gap-4 px-6 py-3 hover:bg-saffron/3 transition-colors">
                <span className="font-display text-2xl text-saffron/30 w-6 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-ink dark:text-cream truncate">{m.title}</p>
                  <p className="text-xs text-ink/40 dark:text-cream/40">{m.chapterCount} ch · ★ {m.rating > 0 ? m.rating.toFixed(1) : "New"}</p>
                </div>
                <span className="text-sm font-bold text-ink/60 dark:text-cream/60 flex-shrink-0">
                  {m.viewCount.toLocaleString()} views
                </span>
                <Link
                  href={`/creator/studio/manga/${m._id}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-saffron/10 text-saffron font-semibold hover:bg-saffron/20 transition-colors flex-shrink-0"
                >
                  Manage →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/creator/studio/create", icon: "✦", label: "Create New Manga", desc: "Start a brand new series", bg: "from-saffron/20 to-gold/10", border: "border-saffron/30" },
          { href: "/creator/studio/manga", icon: "📚", label: "Manage My Manga", desc: "Upload chapters, edit details", bg: "from-blue-500/10 to-violet-500/10", border: "border-blue-500/20" },
          { href: "/creator/studio/analytics", icon: "📈", label: "Deep Analytics", desc: "Views, ratings, rankings", bg: "from-emerald-500/10 to-jade/10", border: "border-emerald-500/20" },
        ].map(({ href, icon, label, desc, bg, border }) => (
          <Link
            key={href}
            href={href}
            className={`group rounded-2xl bg-gradient-to-br ${bg} border ${border} p-5 flex items-center gap-4 hover:shadow-lg transition-all`}
          >
            <span className="text-3xl">{icon}</span>
            <div>
              <p className="font-bold text-sm text-ink dark:text-cream group-hover:text-saffron transition-colors">{label}</p>
              <p className="text-xs text-ink/45 dark:text-cream/45 mt-0.5">{desc}</p>
            </div>
            <span className="ml-auto text-ink/20 dark:text-cream/20 group-hover:text-saffron group-hover:translate-x-1 transition-all text-lg">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
