"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/components/AuthProvider";
import {
  createManga,
  uploadMangaCover,
  uploadChapter,
  getMyManga,
} from "@/app/lib/api";
import type { MangaListItem } from "@/app/lib/types";

const GENRES_LIST = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy",
  "Historical", "Horror", "Mystery", "Romance", "Sci-Fi",
  "Slice of Life", "Sports", "Supernatural", "Thriller",
];

// ─── Gradient palette ────────────────────────────────────────────────────────
const GRADIENT_PRESETS: Array<[string, string, string]> = [
  ["Midnight", "#0f0c29", "#302b63"],
  ["Violet Storm", "#6b2fa0", "#c471ed"],
  ["Forest", "#1a472a", "#2d6a4f"],
  ["Ocean", "#2c3e50", "#3498db"],
  ["Crimson", "#7b0000", "#1a0000"],
  ["Cosmos", "#000428", "#004e92"],
  ["Sunset", "#e65c00", "#f9d423"],
  ["Rose", "#c94b4b", "#4b134f"],
  ["Flame", "#ff6a00", "#ee0979"],
  ["Jungle", "#134e5e", "#71b280"],
];

// ─── Step indicator ──────────────────────────────────────────────────────────
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Manga Details" },
    { n: 2, label: "Cover Image" },
    { n: 3, label: "Upload Chapter" },
  ];
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s.n < current
                  ? "bg-emerald-500 text-white"
                  : s.n === current
                  ? "bg-saffron text-white manga-border"
                  : "bg-ink/10 dark:bg-cream/10 text-ink/40 dark:text-cream/40"
              }`}
            >
              {s.n < current ? "✓" : s.n}
            </div>
            <span
              className={`text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap ${
                s.n === current
                  ? "text-saffron"
                  : "text-ink/40 dark:text-cream/40"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-16 sm:w-24 mx-3 mb-5 transition-all ${
                s.n < current ? "bg-emerald-500" : "bg-ink/10 dark:bg-cream/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-2 bg-ink/10 dark:bg-cream/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-saffron rounded-full transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function CreatorUploadPage() {
  const { user, openDialog } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdManga, setCreatedManga] = useState<MangaListItem | null>(null);
  const [myManga, setMyManga] = useState<MangaListItem[]>([]);
  const [selectedMangaId, setSelectedMangaId] = useState<string>("");

  // ── Step 1: manga details ──
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"ongoing" | "completed" | "hiatus">("ongoing");
  const [origin, setOrigin] = useState<"Indian" | "International">("Indian");
  const [isFree, setIsFree] = useState(false);
  const [ageRating, setAgeRating] = useState<"all" | "teen" | "mature">("all");
  const [gradientIdx, setGradientIdx] = useState(0);

  // ── Step 2: cover ──
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState(0);

  // ── Step 3: chapter ──
  const [chapterNumber, setChapterNumber] = useState(1);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterFree, setChapterFree] = useState(false);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const [chapterProgress, setChapterProgress] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pagesInputRef = useRef<HTMLInputElement>(null);

  // Load creator's existing manga for the "add chapter to existing" flow
  useEffect(() => {
    if (user) {
      getMyManga()
        .then(setMyManga)
        .catch(() => null);
    }
  }, [user]);

  // ── Genre toggle ──
  const toggleGenre = (g: string) => {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  };

  // ── Cover file pick ──
  const onCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  // ── Pages drop ──
  const onPagesDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    setPageFiles((prev) => [...prev, ...files]);
  }, []);

  const onPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setPageFiles((prev) => [...prev, ...files]);
  };

  // ─── Submit Step 1: create manga ──────────────────────────────────────────
  const handleCreateManga = async () => {
    if (!title.trim()) return setError("Title is required");
    if (!description.trim()) return setError("Description is required");
    if (selectedGenres.length === 0) return setError("Select at least one genre");
    setError(null);
    setSubmitting(true);
    try {
      const [gFrom, gTo] = GRADIENT_PRESETS[gradientIdx];
      const manga = await createManga({
        title,
        description,
        genres: selectedGenres,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        status,
        origin,
        isFree,
        ageRating,
        gradientFrom: gFrom,
        gradientTo: gTo,
      });
      setCreatedManga(manga);
      setStep(2);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create manga");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Submit Step 2: upload cover ──────────────────────────────────────────
  const handleUploadCover = async () => {
    const mangaId = createdManga?._id;
    if (!mangaId) return;
    if (!coverFile) return setError("Please select a cover image");
    setError(null);
    setSubmitting(true);
    try {
      await uploadMangaCover(mangaId, coverFile, setCoverProgress);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Cover upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Submit Step 3: upload chapter ───────────────────────────────────────
  const handleUploadChapter = async () => {
    const mangaId = createdManga?._id ?? selectedMangaId;
    if (!mangaId) return setError("No manga selected");
    if (pageFiles.length === 0) return setError("Please add at least one page");
    if (chapterNumber < 1) return setError("Chapter number must be ≥ 1");
    setError(null);
    setSubmitting(true);
    try {
      await uploadChapter(
        mangaId,
        chapterNumber,
        chapterTitle,
        chapterFree,
        pageFiles,
        setChapterProgress
      );
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Chapter upload failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Guard: must be logged in ─────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0C0818] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="font-display text-4xl text-ink dark:text-cream tracking-wider">
            Sign in to upload
          </p>
          <p className="text-ink/50 dark:text-cream/50 text-sm max-w-sm">
            You need a creator account to upload manga.
          </p>
          <button
            onClick={openDialog}
            className="px-8 py-3.5 rounded-full bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all"
          >
            Sign In / Register
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (success) {
    const mangaId = createdManga?._id ?? selectedMangaId;
    return (
      <div className="min-h-screen bg-cream dark:bg-[#0C0818] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 text-center">
          <div className="text-6xl">🎉</div>
          <p className="font-display text-4xl text-ink dark:text-cream tracking-wider">
            Chapter uploaded!
          </p>
          <p className="text-ink/50 dark:text-cream/50 text-sm max-w-sm">
            Your chapter is live and ready to read.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            {mangaId && (
              <button
                onClick={() => router.push(`/manga/${mangaId}`)}
                className="px-8 py-3.5 rounded-full bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all"
              >
                View Manga
              </button>
            )}
            <button
              onClick={() => {
                setSuccess(false);
                setStep(3);
                setPageFiles([]);
                setChapterNumber((n) => n + 1);
                setChapterTitle("");
                setChapterProgress(0);
              }}
              className="px-8 py-3.5 rounded-full border-2 border-saffron/40 text-saffron font-semibold text-sm hover:bg-saffron/10 transition-all"
            >
              Upload Next Chapter
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-[#0C0818]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-28">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold text-saffron uppercase tracking-[0.2em] mb-2">
            Creator Studio
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-ink dark:text-cream tracking-wider">
            {step === 1
              ? "New Manga"
              : step === 2
              ? "Upload Cover"
              : "Upload Chapter"}
          </h1>
        </div>

        <Steps current={step} />

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
            {error}
          </div>
        )}

        {/* ═══════════════════ STEP 1 — Manga Details ═══════════════════════ */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            {/* Or: add chapter to existing manga */}
            {myManga.length > 0 && (
              <div className="p-4 rounded-2xl border-2 border-dashed border-saffron/30 bg-saffron/5">
                <p className="text-sm font-semibold text-saffron mb-3">
                  Want to add a chapter to an existing manga instead?
                </p>
                <select
                  value={selectedMangaId}
                  onChange={(e) => setSelectedMangaId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream text-sm focus:outline-none focus:border-saffron/50"
                >
                  <option value="">Select existing manga…</option>
                  {myManga.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title}
                    </option>
                  ))}
                </select>
                {selectedMangaId && (
                  <button
                    onClick={() => setStep(3)}
                    className="mt-3 px-6 py-2.5 rounded-full bg-saffron text-white font-bold text-sm manga-border hover:bg-saffron/90 transition-all"
                  >
                    Go to chapter upload →
                  </button>
                )}
              </div>
            )}

            <div className="border-t border-ink/10 dark:border-cream/10 pt-6">
              <p className="text-sm font-semibold text-ink/50 dark:text-cream/50 mb-6 uppercase tracking-widest">
                — or create a new manga —
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                Title *
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shadow Realm Chronicles"
                className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/50 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Tell readers what your manga is about…"
                className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/50 transition-colors resize-none"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-3">
                Genres * (select at least one)
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES_LIST.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                      selectedGenres.includes(g)
                        ? "bg-saffron border-saffron text-white"
                        : "border-ink/10 dark:border-cream/10 text-ink/60 dark:text-cream/60 hover:border-saffron/50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                Tags (comma-separated)
              </label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. magic, school, overpowered"
                className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/50 transition-colors"
              />
            </div>

            {/* Row: status / origin / age */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as typeof status)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream text-sm focus:outline-none focus:border-saffron/50"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                  Origin
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value as typeof origin)}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream text-sm focus:outline-none focus:border-saffron/50"
                >
                  <option value="Indian">Indian</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                  Age Rating
                </label>
                <select
                  value={ageRating}
                  onChange={(e) =>
                    setAgeRating(e.target.value as typeof ageRating)
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream text-sm focus:outline-none focus:border-saffron/50"
                >
                  <option value="all">All Ages</option>
                  <option value="teen">Teen</option>
                  <option value="mature">Mature</option>
                </select>
              </div>
            </div>

            {/* Free toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setIsFree((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  isFree ? "bg-saffron" : "bg-ink/20 dark:bg-cream/20"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    isFree ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-ink dark:text-cream">
                Free to read
              </span>
            </label>

            {/* Card gradient preview */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-3">
                Card Gradient (used when no cover)
              </label>
              <div className="flex flex-wrap gap-3">
                {GRADIENT_PRESETS.map(([name, from, to], i) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setGradientIdx(i)}
                    title={name}
                    className={`w-12 h-16 rounded-xl flex-shrink-0 transition-all ${
                      gradientIdx === i
                        ? "ring-3 ring-saffron scale-110"
                        : "ring-1 ring-white/10 hover:scale-105"
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${from}, ${to})`,
                    }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateManga}
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-saffron text-white font-bold text-base manga-border hover:bg-saffron/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {submitting ? "Creating…" : "Create Manga & Continue →"}
            </button>
          </div>
        )}

        {/* ═══════════════════ STEP 2 — Cover Image ════════════════════════ */}
        {step === 2 && createdManga && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-ink/60 dark:text-cream/60">
              Upload a cover image for{" "}
              <span className="font-bold text-ink dark:text-cream">
                {createdManga.title}
              </span>
              . Recommended: 400×600px or 2:3 ratio.
            </p>

            {/* Drop zone */}
            <div
              onClick={() => coverInputRef.current?.click()}
              className="relative cursor-pointer border-2 border-dashed border-saffron/40 rounded-2xl overflow-hidden flex items-center justify-center"
              style={{ aspectRatio: "2/3", maxHeight: "480px" }}
            >
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center py-16 px-6">
                  <div className="text-5xl mb-4">🖼️</div>
                  <p className="font-semibold text-ink/70 dark:text-cream/70 text-sm">
                    Click to choose a cover image
                  </p>
                  <p className="text-xs text-ink/40 dark:text-cream/40 mt-1">
                    JPG, PNG, WebP · Max 10 MB
                  </p>
                </div>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={onCoverChange}
                className="hidden"
              />
            </div>

            {submitting && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-ink/50 dark:text-cream/50">
                  Uploading… {coverProgress}%
                </p>
                <ProgressBar pct={coverProgress} />
              </div>
            )}

            <button
              onClick={handleUploadCover}
              disabled={submitting || !coverFile}
              className="w-full py-4 rounded-2xl bg-saffron text-white font-bold text-base manga-border hover:bg-saffron/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? `Uploading… ${coverProgress}%` : "Upload Cover & Continue →"}
            </button>

            <button
              onClick={() => setStep(3)}
              className="text-center text-sm text-ink/40 dark:text-cream/40 hover:text-saffron transition-colors"
            >
              Skip for now →
            </button>
          </div>
        )}

        {/* ═══════════════════ STEP 3 — Upload Chapter ══════════════════════ */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <p className="text-sm text-ink/60 dark:text-cream/60">
              Upload pages for a new chapter of{" "}
              <span className="font-bold text-ink dark:text-cream">
                {createdManga?.title ?? myManga.find((m) => m._id === selectedMangaId)?.title ?? "your manga"}
              </span>
              . Pages will be saved in upload order.
            </p>

            {/* Chapter details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                  Chapter Number *
                </label>
                <input
                  type="number"
                  value={chapterNumber}
                  min={1}
                  onChange={(e) =>
                    setChapterNumber(parseInt(e.target.value, 10) || 1)
                  }
                  className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream text-sm focus:outline-none focus:border-saffron/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-2">
                  Chapter Title (optional)
                </label>
                <input
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="e.g. The Awakening"
                  className="w-full px-4 py-3 rounded-2xl border-2 border-ink/10 dark:border-cream/10 bg-white dark:bg-white/5 text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 text-sm focus:outline-none focus:border-saffron/50 transition-colors"
                />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setChapterFree((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  chapterFree ? "bg-saffron" : "bg-ink/20 dark:bg-cream/20"
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    chapterFree ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
              <span className="text-sm font-semibold text-ink dark:text-cream">
                Free chapter
              </span>
            </label>

            {/* Pages drop zone */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/50 dark:text-cream/50 mb-3">
                Pages * ({pageFiles.length} selected)
              </label>
              <div
                onDrop={onPagesDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => pagesInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-saffron/40 rounded-2xl p-10 text-center hover:border-saffron/70 transition-colors"
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="font-semibold text-ink/70 dark:text-cream/70 text-sm">
                  Drag & drop images here, or click to browse
                </p>
                <p className="text-xs text-ink/40 dark:text-cream/40 mt-1">
                  Supports JPG, PNG, WebP · Max 20 MB per image · Up to 1000 pages
                </p>
                <input
                  ref={pagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPagesChange}
                  className="hidden"
                />
              </div>

              {/* Page thumbnails preview */}
              {pageFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-ink/60 dark:text-cream/60">
                      {pageFiles.length} pages ready to upload
                    </p>
                    <button
                      onClick={() => setPageFiles([])}
                      className="text-xs text-red-400 hover:text-red-500 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto rounded-xl border border-ink/10 dark:border-cream/10 p-2">
                    {pageFiles.map((f, i) => (
                      <div
                        key={i}
                        className="aspect-[2/3] rounded-md overflow-hidden bg-ink/10 dark:bg-cream/10 relative group"
                      >
                        <img
                          src={URL.createObjectURL(f)}
                          alt={`Page ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPageFiles((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              );
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold transition-opacity"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {submitting && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-ink/50 dark:text-cream/50">
                  Uploading {pageFiles.length} pages… {chapterProgress}%
                </p>
                <ProgressBar pct={chapterProgress} />
              </div>
            )}

            <button
              onClick={handleUploadChapter}
              disabled={submitting || pageFiles.length === 0}
              className="w-full py-4 rounded-2xl bg-saffron text-white font-bold text-base manga-border hover:bg-saffron/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting
                ? `Uploading ${pageFiles.length} pages… ${chapterProgress}%`
                : `Upload Chapter ${chapterNumber} (${pageFiles.length} pages)`}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
