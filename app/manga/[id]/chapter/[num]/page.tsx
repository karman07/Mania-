"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getMangaChapter, getMangaChapters } from "@/app/lib/api";
import type { ChapterFull, ChapterListItem } from "@/app/lib/types";
import CommentsSection from "@/app/components/CommentsSection";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ChapterReaderPage() {
  const params = useParams();
  const router = useRouter();
  const mangaId = params.id as string;
  const chapterNum = parseInt(params.num as string, 10);

  const [chapter, setChapter] = useState<ChapterFull | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const lastScrollY = useRef(0);

  // Auto-hide nav on scroll down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setNavVisible(y < lastScrollY.current || y < 100);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mangaId || isNaN(chapterNum)) return;
    setLoading(true);
    setError(null);
    Promise.all([
      getMangaChapter(mangaId, chapterNum),
      getMangaChapters(mangaId),
    ])
      .then(([ch, chs]) => {
        setChapter(ch);
        setAllChapters(chs);
      })
      .catch((err) => setError(err.message ?? "Chapter not found"))
      .finally(() => setLoading(false));
  }, [mangaId, chapterNum]);

  // Track current page via IntersectionObserver
  const observerRef = useRef<IntersectionObserver | null>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setPageRef = useCallback((idx: number, el: HTMLDivElement | null) => {
    if (el) pageRefs.current.set(idx, el);
    else pageRefs.current.delete(idx);
  }, []);

  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(
              (entry.target as HTMLElement).dataset.pageIdx ?? "0",
              10
            );
            setCurrentPage(idx + 1);
          }
        });
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: 0.1 }
    );
    pageRefs.current.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, [chapter?.pages]);

  const prevNum = allChapters.find((c) => c.chapterNumber === chapterNum - 1)?.chapterNumber;
  const nextNum = allChapters.find((c) => c.chapterNumber === chapterNum + 1)?.chapterNumber;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-saffron/30 border-t-saffron animate-spin" />
        <p className="text-white/60 text-sm font-medium">Loading chapter…</p>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="font-display text-4xl text-white/20">Chapter not found</p>
        <p className="text-white/40 text-sm">{error}</p>
        <Link
          href={`/manga/${mangaId}`}
          className="mt-4 px-6 py-3 rounded-full bg-saffron text-white font-semibold text-sm hover:bg-saffron/90 transition-all"
        >
          Back to manga
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111] text-white">
      {/* ── Sticky navigation bar ── */}
      <div
        className={`fixed top-0 inset-x-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/8 transition-transform duration-300 ${
          navVisible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link
            href={`/manga/${mangaId}`}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="text-lg">←</span>
            <span className="hidden sm:inline">Back</span>
          </Link>

          <div className="flex-1 text-center">
            <p className="text-sm font-semibold text-white truncate">
              Chapter {chapterNum}
              {chapter.title ? ` — ${chapter.title}` : ""}
            </p>
            <p className="text-[10px] text-white/40">
              Page {currentPage} / {chapter.pageCount}
            </p>
          </div>

          {/* Chapter select */}
          <select
            value={chapterNum}
            onChange={(e) =>
              router.push(`/manga/${mangaId}/chapter/${e.target.value}`)
            }
            className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-saffron/50 cursor-pointer"
          >
            {allChapters.map((ch) => (
              <option key={ch._id} value={ch.chapterNumber} className="bg-[#111]">
                Ch. {ch.chapterNumber}
                {ch.title ? ` — ${ch.title}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Page reader ── */}
      <div className="pt-14">
        {chapter.pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
            <p className="font-display text-3xl text-white/20">No pages yet</p>
            <p className="text-white/40 text-sm">Pages will appear once uploaded.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {chapter.pages.map((pagePath, idx) => (
              <div
                key={idx}
                ref={(el) => setPageRef(idx, el)}
                data-page-idx={idx}
                className="w-full max-w-3xl"
              >
                <img
                  src={`${API}${pagePath}`}
                  alt={`Page ${idx + 1}`}
                  loading={idx < 3 ? "eager" : "lazy"}
                  className="w-full h-auto block"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        )}

        {/* ── End-of-chapter navigation ── */}
        <div className="max-w-3xl mx-auto px-4 py-12 flex items-center justify-between gap-4">
          {prevNum != null ? (
            <Link
              href={`/manga/${mangaId}/chapter/${prevNum}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white/20 text-white/80 font-semibold text-sm hover:border-saffron/60 hover:text-saffron transition-all"
            >
              ← Chapter {prevNum}
            </Link>
          ) : (
            <div />
          )}

          <Link
            href={`/manga/${mangaId}`}
            className="text-white/40 hover:text-white transition-colors text-sm"
          >
            All chapters
          </Link>

          {nextNum != null ? (
            <Link
              href={`/manga/${mangaId}/chapter/${nextNum}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-saffron text-white font-semibold text-sm hover:bg-saffron/90 transition-all manga-border"
            >
              Chapter {nextNum} →
            </Link>
          ) : (
            <Link
              href={`/manga/${mangaId}`}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-saffron/40 text-saffron font-semibold text-sm hover:bg-saffron/10 transition-all"
            >
              Finished ✓
            </Link>
          )}
        </div>

        {/* ── Chapter comments ── */}
        <div className="bg-cream dark:bg-[#0A0A0A] border-t border-white/8">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <CommentsSection
              mangaId={mangaId}
              chapterNumber={chapterNum}
              title={`Chapter ${chapterNum} Discussion`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
