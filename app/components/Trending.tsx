"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFeaturedManga } from "@/app/lib/api";
import type { MangaListItem } from "@/app/lib/types";

function MangaCard({ manga }: { manga: MangaListItem }) {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const coverUrl = manga.coverImage ? `${API}${manga.coverImage}` : null;

  return (
    <Link
      href={`/manga/${manga._id}`}
      className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden transition-all hover:-translate-y-3 hover:shadow-[0_0_40px_rgba(168,85,247,0.25)] hover:border-purple-500/40"
    >
      <div className="relative h-[260px] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={manga.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${manga.gradientFrom ?? "#a855f7"}, ${manga.gradientTo ?? "#6d28d9"})` }}
          >
            <span className="font-bold text-7xl text-white/20 select-none">
              {manga.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{manga.title}</h3>
        <p className="text-sm text-gray-400 mt-1">{manga.genres[0] ?? "Manga"}</p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-[260px] bg-white/5" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
        <div className="h-3 bg-white/5 rounded w-1/2" />
      </div>
    </div>
  );
}

export default function Trending() {
  const [manga, setManga] = useState<MangaListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeaturedManga()
      .then((data) => { setManga(data.slice(0, 5)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">Trending Now</h2>
        <Link href="/browse" className="text-purple-400 hover:text-purple-300 transition">
          View All →
        </Link>
      </div>

      <div className="grid md:grid-cols-5 gap-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : manga.map((m) => <MangaCard key={m._id} manga={m} />)
        }
      </div>
    </section>
  );
}
