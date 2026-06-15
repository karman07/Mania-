"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyMangaDetail, getMyChapters, updateManga, updateMangaStatus, uploadMangaCover, uploadChapter } from "@/app/lib/api";
import type { MangaDetail, ChapterListItem } from "@/app/lib/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function ManageMangaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [manga, setManga] = useState<MangaDetail | null>(null);
  const [chapters, setChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit state
  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState<"ongoing" | "completed" | "hiatus">("ongoing");
  const [saving, setSaving] = useState(false);

  // Cover upload
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverProgress, setCoverProgress] = useState(0);

  // Chapter upload
  const pagesInputRef = useRef<HTMLInputElement>(null);
  const [chUploadOpen, setChUploadOpen] = useState(false);
  const [chNum, setChNum] = useState("");
  const [chTitle, setChTitle] = useState("");
  const [chFree, setChFree] = useState(false);
  const [chFiles, setChFiles] = useState<File[]>([]);
  const [chUploading, setChUploading] = useState(false);
  const [chProgress, setChProgress] = useState(0);

  useEffect(() => {
    if (!id) return;
    Promise.all([getMyMangaDetail(id), getMyChapters(id)])
      .then(([m, chs]) => {
        setManga(m);
        setChapters(chs);
        setEditTitle(m.title);
        setEditDesc(m.description);
        setEditStatus(m.status);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveEdits() {
    if (!manga || saving) return;
    setSaving(true);
    try {
      await updateManga(id, { title: editTitle, description: editDesc, status: editStatus });
      setManga((m) => m ? { ...m, title: editTitle, description: editDesc, status: editStatus } : m);
      setEditMode(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !manga) return;
    setCoverUploading(true);
    setCoverProgress(0);
    try {
      const updated = await uploadMangaCover(id, file, (pct) => setCoverProgress(pct));
      setManga((m) => m ? { ...m, coverImage: updated.coverImage } : m);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleChapterUpload() {
    if (!chNum || chFiles.length === 0 || chUploading) return;
    setChUploading(true);
    setChProgress(0);
    try {
      await uploadChapter(id, parseInt(chNum), chTitle, chFree, chFiles, (pct) => setChProgress(pct));
      const updated = await getMyChapters(id);
      setChapters(updated);
      setChNum("");
      setChTitle("");
      setChFree(false);
      setChFiles([]);
      setChUploadOpen(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setChUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 rounded-xl bg-ink/5 dark:bg-cream/5 animate-pulse" />
        <div className="h-48 rounded-2xl bg-ink/5 dark:bg-cream/5 animate-pulse" />
        <div className="h-64 rounded-2xl bg-ink/5 dark:bg-cream/5 animate-pulse" />
      </div>
    );
  }

  if (error || !manga) {
    return (
      <div className="text-center py-20">
        <p className="text-ink/30 dark:text-cream/30">{error ?? "Not found"}</p>
        <Link href="/creator/studio/manga" className="text-saffron text-sm mt-4 inline-block">← Back to My Manga</Link>
      </div>
    );
  }

  const coverUrl = manga.coverImage ? `${API}${manga.coverImage}` : null;

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink/40 dark:text-cream/40">
        <Link href="/creator/studio/manga" className="hover:text-saffron transition-colors">My Manga</Link>
        <span>›</span>
        <span className="text-ink/70 dark:text-cream/70 truncate">{manga.title}</span>
      </div>

      {/* Header card */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1130] border border-ink/8 dark:border-cream/8 p-6 flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <div className="flex-shrink-0 flex flex-col items-center gap-3">
          <div
            className="w-32 aspect-[2/3] rounded-xl overflow-hidden relative"
            style={!coverUrl ? { background: `linear-gradient(135deg,${manga.gradientFrom},${manga.gradientTo})` } : undefined}
          >
            {coverUrl ? (
              <Image src={coverUrl} alt={manga.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-display text-4xl text-white/30">
                {manga.title.charAt(0)}
              </div>
            )}
            {coverUploading && (
              <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-white text-xs">{coverProgress}%</span>
              </div>
            )}
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
          <button
            id="upload-cover-btn"
            onClick={() => coverInputRef.current?.click()}
            disabled={coverUploading}
            className="text-xs px-4 py-2 rounded-lg bg-saffron/10 text-saffron font-bold hover:bg-saffron/20 transition-colors disabled:opacity-40"
          >
            {coverUploading ? "Uploading…" : "Change Cover"}
          </button>
        </div>

        {/* Details / Edit */}
        <div className="flex-1 min-w-0">
          {editMode ? (
            <div className="space-y-3">
              <input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-4 py-2.5 text-lg font-bold text-ink dark:text-cream focus:outline-none focus:border-saffron/50"
                placeholder="Title"
              />
              <textarea
                id="edit-description"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-ink/15 dark:border-cream/15 bg-transparent px-4 py-2.5 text-sm text-ink dark:text-cream resize-none focus:outline-none focus:border-saffron/50"
                placeholder="Description"
              />
              <select
                id="edit-status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1130] px-3 py-2 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50"
              >
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="hiatus">Hiatus</option>
              </select>
              <div className="flex gap-3">
                <button id="save-edits-btn" onClick={saveEdits} disabled={saving} className="px-5 py-2 rounded-full bg-saffron text-white text-sm font-bold disabled:opacity-40 hover:bg-saffron/90 transition-all">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                <button onClick={() => setEditMode(false)} className="px-5 py-2 rounded-full border border-ink/15 dark:border-cream/15 text-sm text-ink/60 dark:text-cream/60 hover:border-saffron/40 transition-all">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3">
                <h1 className="font-display text-3xl text-ink dark:text-cream tracking-wider">{manga.title}</h1>
                <button id="edit-manga-btn" onClick={() => setEditMode(true)} className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-ink/8 dark:bg-cream/8 text-ink/60 dark:text-cream/60 hover:text-saffron hover:bg-saffron/10 transition-colors">
                  Edit
                </button>
              </div>
              <p className="text-sm text-ink/60 dark:text-cream/60 mt-2 leading-relaxed line-clamp-3">{manga.description}</p>
              <div className="flex flex-wrap gap-4 mt-4 text-xs text-ink/50 dark:text-cream/50">
                <span>Status: <b className="text-ink dark:text-cream capitalize">{manga.status}</b></span>
                <span>Published: <b className="text-ink dark:text-cream capitalize">{manga.publishedStatus}</b></span>
                <span>Views: <b className="text-ink dark:text-cream">{manga.viewCount.toLocaleString()}</b></span>
                <span>Rating: <b className="text-ink dark:text-cream">★ {manga.rating > 0 ? manga.rating.toFixed(1) : "New"}</b></span>
              </div>
              <div className="flex gap-2 mt-4">
                <Link href={`/creator/studio/analytics?manga=${manga._id}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-colors">
                  View Analytics
                </Link>
                {manga.isPublished && (
                  <Link href={`/manga/${manga._id}`} target="_blank"
                    className="text-xs px-3 py-1.5 rounded-lg bg-ink/8 dark:bg-cream/8 text-ink/60 dark:text-cream/60 font-semibold hover:bg-saffron/10 hover:text-saffron transition-colors">
                    View Public Page ↗
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chapters section */}
      <div className="rounded-2xl bg-white dark:bg-[#1A1130] border border-ink/8 dark:border-cream/8 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/8 dark:border-cream/8">
          <h2 className="font-bold text-ink dark:text-cream">
            Chapters <span className="text-saffron">({chapters.length})</span>
          </h2>
          <button
            id="add-chapter-btn"
            onClick={() => setChUploadOpen(!chUploadOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-saffron text-white text-sm font-bold hover:bg-saffron/90 transition-all"
          >
            + Add Chapter
          </button>
        </div>

        {/* Chapter upload panel */}
        {chUploadOpen && (
          <div className="px-6 py-5 border-b border-ink/8 dark:border-cream/8 bg-saffron/3">
            <h3 className="font-bold text-sm text-ink dark:text-cream mb-4">Upload New Chapter</h3>
            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <input
                id="ch-num-input"
                type="number"
                min="1"
                value={chNum}
                onChange={(e) => setChNum(e.target.value)}
                placeholder="Chapter #"
                className="rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1130] px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50"
              />
              <input
                id="ch-title-input"
                type="text"
                value={chTitle}
                onChange={(e) => setChTitle(e.target.value)}
                placeholder="Chapter title (optional)"
                className="rounded-xl border border-ink/15 dark:border-cream/15 bg-white dark:bg-[#1A1130] px-3 py-2.5 text-sm text-ink dark:text-cream focus:outline-none focus:border-saffron/50"
              />
              <label className="flex items-center gap-2 text-sm text-ink/60 dark:text-cream/60 cursor-pointer">
                <input type="checkbox" checked={chFree} onChange={(e) => setChFree(e.target.checked)} className="w-4 h-4 accent-saffron" />
                Free chapter
              </label>
            </div>

            <div className="mb-3">
              <input
                ref={pagesInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => setChFiles(Array.from(e.target.files ?? []))}
              />
              <button
                id="select-pages-btn"
                onClick={() => pagesInputRef.current?.click()}
                className="w-full py-6 rounded-xl border-2 border-dashed border-ink/15 dark:border-cream/15 hover:border-saffron/40 text-sm text-ink/40 dark:text-cream/40 hover:text-saffron transition-all"
              >
                {chFiles.length > 0 ? `✓ ${chFiles.length} pages selected` : "Click to select page images"}
              </button>
            </div>

            {chUploading && (
              <div className="mb-3">
                <div className="h-2 rounded-full bg-ink/8 dark:bg-cream/8 overflow-hidden">
                  <div className="h-full bg-saffron rounded-full transition-all" style={{ width: `${chProgress}%` }} />
                </div>
                <p className="text-xs text-ink/40 dark:text-cream/40 mt-1">Uploading… {chProgress}%</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                id="upload-chapter-btn"
                onClick={handleChapterUpload}
                disabled={!chNum || chFiles.length === 0 || chUploading}
                className="px-6 py-2.5 rounded-full bg-saffron text-white text-sm font-bold disabled:opacity-40 hover:bg-saffron/90 transition-all"
              >
                {chUploading ? "Uploading…" : "Upload Chapter"}
              </button>
              <button onClick={() => setChUploadOpen(false)} className="px-6 py-2.5 rounded-full border border-ink/15 dark:border-cream/15 text-sm text-ink/60 dark:text-cream/60 hover:border-saffron/40 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Chapter list */}
        {chapters.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-ink/25 dark:text-cream/25 font-display text-2xl">No chapters yet</p>
            <p className="text-xs text-ink/30 dark:text-cream/30 mt-1">Add your first chapter above</p>
          </div>
        ) : (
          <div className="divide-y divide-ink/5 dark:divide-cream/5">
            {chapters.map((ch) => (
              <div key={ch._id} className="flex items-center gap-4 px-6 py-3">
                <span className="font-display text-2xl text-saffron/30 w-8 text-right flex-shrink-0">{ch.chapterNumber}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-cream">{ch.title || `Chapter ${ch.chapterNumber}`}</p>
                  <p className="text-xs text-ink/35 dark:text-cream/35">{ch.pageCount} pages · {ch.viewCount.toLocaleString()} views · {new Date(ch.createdAt).toLocaleDateString()}</p>
                </div>
                {ch.isFree && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-jade/15 text-jade">FREE</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
