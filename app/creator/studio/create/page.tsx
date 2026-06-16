"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createManga, uploadMangaCover, uploadChapter } from "@/app/lib/api";
import dynamic from "next/dynamic";
import type { CanvasPage } from "@/app/creator/studio/components/ExcalidrawEditor";

const ExcalidrawEditor = dynamic(
  () => import("@/app/creator/studio/components/ExcalidrawEditor"),
  { ssr: false }
);

const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller"];

type Step = 1 | 2 | 3 | 4;

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Details" },
    { n: 2, label: "Cover" },
    { n: 3, label: "Draw" },
    { n: 4, label: "Publish" },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-0 flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
              n < current ? "bg-emerald-500 text-white" :
              n === current ? "bg-saffron text-white shadow-lg shadow-saffron/30" :
              "bg-ink/10 dark:bg-cream/10 text-ink/30 dark:text-cream/30"
            }`}>
              {n < current ? "✓" : n}
            </div>
            <span className={`text-[10px] font-semibold hidden sm:block ${n === current ? "text-saffron" : "text-ink/30 dark:text-cream/30"}`}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${n < current ? "bg-emerald-500" : "bg-ink/10 dark:bg-cream/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CreateMangaPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1: Metadata
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState<"ongoing" | "completed" | "hiatus">("ongoing");
  const [origin, setOrigin] = useState<"Indian" | "International">("Indian");
  const [language, setLanguage] = useState("English");
  const [ageRating, setAgeRating] = useState<"all" | "teen" | "mature">("all");
  const [isFree, setIsFree] = useState(true);
  const [badge, setBadge] = useState<"HOT" | "NEW" | "TOP" | null>(null);
  const [metaError, setMetaError] = useState("");

  // Step 2: Cover
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverProgress, setCoverProgress] = useState(0);

  // Step 3: Excalidraw pages
  const [canvasPages, setCanvasPages] = useState<CanvasPage[]>([]);

  // Step 4: Publish / created manga id
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [chapterNum, setChapterNum] = useState("1");
  const [chapterTitle, setChapterTitle] = useState("Chapter 1");

  function toggleGenre(g: string) {
    setSelectedGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  }

  function handleCoverFile(file: File) {
    setCoverFile(file);
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  }

  function handleCoverDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleCoverFile(file);
  }

  async function handleCreate() {
    if (!title.trim()) { setMetaError("Title is required"); return; }
    if (!desc.trim()) { setMetaError("Description is required"); return; }
    setMetaError("");

    if (createdId) { setStep(2); return; }

    setCreating(true);
    try {
      const manga = await createManga({
        title: title.trim(),
        description: desc.trim(),
        genres: selectedGenres,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        status,
        origin,
        language,
        isFree,
        ageRating,
        badge,
      });
      setCreatedId(manga._id);
      setStep(2);
    } catch (e: any) {
      setMetaError(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleCoverUpload() {
    if (!createdId) return;
    if (!coverFile) { setStep(3); return; } // skip if no cover
    setCreating(true);
    try {
      await uploadMangaCover(createdId, coverFile, (pct) => setCoverProgress(pct));
      setStep(3);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleChapterUpload() {
    if (!createdId || canvasPages.length === 0) { setStep(4); return; }
    setCreating(true);
    try {
      const files = canvasPages.map((p, i) => new File([p.blob], `page-${String(i + 1).padStart(4, "0")}.png`, { type: "image/png" }));
      await uploadChapter(createdId, parseInt(chapterNum), chapterTitle, isFree, files, () => {});
      setStep(4);
    } catch (e: any) {
      setPublishError(e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-4xl text-ink dark:text-cream tracking-wider">
          Create <span className="gradient-text">New Manga</span>
        </h1>
        <p className="text-sm text-ink/45 dark:text-cream/45 mt-1">Build your series step by step</p>
      </div>

      <StepIndicator current={step} />

      {/* ── Step 1: Metadata ── */}
      {step === 1 && (
        <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-6 space-y-5">
          <h2 className="font-bold text-lg text-ink dark:text-cream">Series Details</h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Title *</label>
              <input
                id="manga-title-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Arjun: The Dharma Knight"
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-4 py-3 text-sm text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 focus:outline-none focus:border-saffron/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Description *</label>
              <textarea
                id="manga-desc-input"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Tell readers what your manga is about…"
                rows={4}
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-4 py-3 text-sm text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 resize-none focus:outline-none focus:border-saffron/50 transition-colors"
              />
            </div>

            {/* Genres */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-2 block">Genres</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    id={`genre-${g}`}
                    onClick={() => toggleGenre(g)}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${
                      selectedGenres.includes(g)
                        ? "bg-saffron text-white"
                        : "bg-ink/8 dark:bg-cream/8 text-ink/60 dark:text-cream/60 hover:bg-saffron/10 hover:text-saffron"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Tags (comma separated)</label>
              <input
                id="manga-tags-input"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. mythology, swords, epic"
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-4 py-3 text-sm text-ink dark:text-cream placeholder:text-ink/30 dark:placeholder:text-cream/30 focus:outline-none focus:border-saffron/50 transition-colors"
              />
            </div>

            {/* Options row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Series Status</label>
                <select id="manga-status-select" value={status} onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1A1A] px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50">
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Origin</label>
                <select id="manga-origin-select" value={origin} onChange={(e) => setOrigin(e.target.value as any)}
                  className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1A1A] px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50">
                  <option value="Indian">Indian</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Age Rating</label>
                <select id="manga-age-select" value={ageRating} onChange={(e) => setAgeRating(e.target.value as any)}
                  className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1A1A] px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50">
                  <option value="all">All Ages</option>
                  <option value="teen">Teen</option>
                  <option value="mature">Mature</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Badge</label>
                <select id="manga-badge-select" value={badge ?? ""} onChange={(e) => setBadge((e.target.value || null) as any)}
                  className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1A1A] px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50">
                  <option value="">None</option>
                  <option value="HOT">HOT</option>
                  <option value="NEW">NEW</option>
                  <option value="TOP">TOP</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input id="manga-free-check" type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="w-4 h-4 accent-saffron" />
              <div>
                <p className="text-sm font-semibold text-ink dark:text-cream">Free to read</p>
                <p className="text-xs text-ink/40 dark:text-cream/40">All readers can access without a subscription</p>
              </div>
            </label>
          </div>

          {metaError && <p className="text-sm text-red-500 font-semibold">{metaError}</p>}

          <button
            id="step1-next-btn"
            onClick={handleCreate}
            disabled={creating}
            className="w-full py-3 rounded-full bg-saffron text-white font-bold text-sm disabled:opacity-40 hover:bg-saffron/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-saffron/25"
          >
            {creating ? "Creating…" : "Next: Upload Cover →"}
          </button>
        </div>
      )}

      {/* ── Step 2: Cover ── */}
      {step === 2 && (
        <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-6 space-y-5">
          <h2 className="font-bold text-lg text-ink dark:text-cream">Cover Image</h2>
          <p className="text-sm text-ink/50 dark:text-cream/50">Add a striking cover image for your manga. You can skip this and add it later.</p>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleCoverDrop}
            onClick={() => coverInputRef.current?.click()}
            className="cursor-pointer"
          >
            {coverPreview ? (
              <div className="flex items-center gap-6">
                <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0">
                  <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink dark:text-cream">{coverFile?.name}</p>
                  <p className="text-xs text-ink/40 dark:text-cream/40 mt-1">{((coverFile?.size ?? 0) / 1024 / 1024).toFixed(2)} MB</p>
                  <button className="text-xs text-saffron hover:underline mt-2" onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}>Remove</button>
                </div>
              </div>
            ) : (
              <div className="py-16 rounded-2xl border-2 border-dashed border-ink/15 dark:border-cream/15 hover:border-saffron/40 text-center transition-all">
                <div className="text-4xl mb-2">🖼️</div>
                <p className="text-sm font-semibold text-ink/50 dark:text-cream/50">Drag & drop or click to upload</p>
                <p className="text-xs text-ink/30 dark:text-cream/30 mt-1">PNG, JPG, WebP · Max 10MB · Recommended: 480×720</p>
              </div>
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverFile(f); }} />

          {creating && (
            <div>
              <div className="h-2 rounded-full bg-ink/8 dark:bg-cream/8 overflow-hidden">
                <div className="h-full bg-saffron rounded-full transition-all" style={{ width: `${coverProgress}%` }} />
              </div>
              <p className="text-xs text-ink/40 dark:text-cream/40 mt-1">Uploading… {coverProgress}%</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleCoverUpload} disabled={creating}
              className="flex-1 py-3 rounded-full bg-saffron text-white font-bold text-sm disabled:opacity-40 hover:bg-saffron/90 transition-all">
              {creating ? "Uploading…" : coverFile ? "Upload Cover & Continue →" : "Skip for Now →"}
            </button>
            <button onClick={() => setStep(1)} className="px-6 py-3 rounded-full border border-ink/15 dark:border-cream/15 text-sm font-semibold text-ink/60 dark:text-cream/60 hover:border-saffron/40 transition-all">
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Excalidraw ── */}
      {step === 3 && (
        <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-bold text-lg text-ink dark:text-cream">Draw Chapter 1</h2>
              <p className="text-sm text-ink/50 dark:text-cream/50 mt-0.5">Use the canvas to sketch your pages, then save each one. You can also skip and upload pages later.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-2">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Chapter Number</label>
              <input
                id="ch-num-wizard"
                type="number"
                min="1"
                value={chapterNum}
                onChange={(e) => setChapterNum(e.target.value)}
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-ink/40 dark:text-cream/40 mb-1 block">Chapter Title</label>
              <input
                id="ch-title-wizard"
                value={chapterTitle}
                onChange={(e) => setChapterTitle(e.target.value)}
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50"
              />
            </div>
          </div>

          <div className="min-h-[560px]">
            <ExcalidrawEditor pages={canvasPages} onPagesChange={setCanvasPages} />
          </div>

          <div className="flex gap-3">
            <button
              id="step3-next-btn"
              onClick={handleChapterUpload}
              disabled={creating}
              className="flex-1 py-3 rounded-full bg-saffron text-white font-bold text-sm disabled:opacity-40 hover:bg-saffron/90 transition-all"
            >
              {creating ? "Uploading pages…" :
                canvasPages.length > 0 ? `Upload ${canvasPages.length} Page${canvasPages.length > 1 ? "s" : ""} & Finish →` : "Skip for Now →"}
            </button>
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-full border border-ink/15 dark:border-cream/15 text-sm font-semibold text-ink/60 dark:text-cream/60 hover:border-saffron/40 transition-all">
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Done ── */}
      {step === 4 && (
        <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-ink/8 dark:border-cream/8 p-10 text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h2 className="font-display text-4xl text-ink dark:text-cream tracking-wider">
            Your manga is <span className="gradient-text">live!</span>
          </h2>
          <p className="text-sm text-ink/50 dark:text-cream/50 max-w-sm mx-auto">
            <strong className="text-ink dark:text-cream">{title}</strong> has been created. Head to the manage page to add more chapters and polish your series.
          </p>
          {publishError && <p className="text-sm text-red-500">{publishError}</p>}
          <div className="flex flex-wrap gap-3 justify-center">
            {createdId && (
              <a
                href={`/manga/${createdId}`}
                target="_blank"
                className="px-6 py-3 rounded-full bg-saffron text-white font-bold text-sm hover:bg-saffron/90 transition-all"
              >
                View Public Page ↗
              </a>
            )}
            {createdId && (
              <a href={`/creator/studio/manga/${createdId}`}
                className="px-6 py-3 rounded-full border-2 border-saffron/30 text-saffron font-bold text-sm hover:bg-saffron/10 transition-all">
                Manage Manga →
              </a>
            )}
            <button onClick={() => router.push("/creator/studio/manga")}
              className="px-6 py-3 rounded-full border border-ink/15 dark:border-cream/15 text-sm font-semibold text-ink/60 dark:text-cream/60 hover:border-saffron/40 transition-all">
              My Manga
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
