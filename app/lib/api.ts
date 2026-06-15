/**
 * Typed API client for the Pradhan Manga backend.
 */

import { getAuth } from 'firebase/auth';
import type {
  MangaListItem,
  MangaDetail,
  PaginatedManga,
  MangaStats,
  ChapterListItem,
  ChapterFull,
  MangaComment,
  RatingResult,
  MangaAnalytics,
  CreatorStats,
} from './types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Auth token helper ────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return null;
    return await user.getIdToken();
  } catch {
    return null;
  }
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers['authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const json = await res.json();
      message = json?.message ?? message;
    } catch { /* ignore */ }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

// ─── XHR upload helper ────────────────────────────────────────────────────────

function xhrUpload<T>(
  method: string,
  url: string,
  formData: FormData,
  token: string | null,
  onProgress?: (pct: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    if (token) xhr.setRequestHeader('authorization', `Bearer ${token}`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { resolve(undefined as unknown as T); }
      } else {
        try { reject(new Error(JSON.parse(xhr.responseText)?.message ?? 'Upload failed')); }
        catch { reject(new Error('Upload failed')); }
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
}

// ─── Public manga reads ───────────────────────────────────────────────────────

export interface BrowseQuery {
  genre?: string;
  status?: string;
  free?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getManga(query: BrowseQuery = {}): Promise<PaginatedManga> {
  const params = new URLSearchParams();
  if (query.genre && query.genre !== 'All') params.set('genre', query.genre);
  if (query.status) params.set('status', query.status);
  if (query.free) params.set('free', 'true');
  if (query.search?.trim()) params.set('search', query.search.trim());
  if (query.sort) params.set('sort', query.sort);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));
  const qs = params.toString();
  return apiFetch<PaginatedManga>(`/manga${qs ? `?${qs}` : ''}`);
}

export async function getFeaturedManga(): Promise<MangaListItem[]> {
  return apiFetch<MangaListItem[]>('/manga/featured');
}

export async function getMangaStats(): Promise<MangaStats> {
  return apiFetch<MangaStats>('/manga/stats');
}

export async function getMangaDetail(id: string): Promise<MangaDetail> {
  return apiFetch<MangaDetail>(`/manga/${id}`);
}

export async function incrementMangaView(id: string): Promise<void> {
  await apiFetch<void>(`/manga/${id}/view`, { method: 'PATCH' });
}

export async function getMangaChapters(id: string): Promise<ChapterListItem[]> {
  return apiFetch<ChapterListItem[]>(`/manga/${id}/chapters`);
}

export async function getMangaChapter(id: string, num: number): Promise<ChapterFull> {
  return apiFetch<ChapterFull>(`/manga/${id}/chapters/${num}`);
}

export async function getCreatorManga(creatorId: string): Promise<MangaListItem[]> {
  return apiFetch<MangaListItem[]>(`/manga/creator/${creatorId}`);
}

// ─── Creator dashboard reads ──────────────────────────────────────────────────

export async function getMyManga(status?: string): Promise<MangaListItem[]> {
  const qs = status ? `?status=${status}` : '';
  return apiFetch<MangaListItem[]>(`/manga/my${qs}`, {}, true);
}

export async function getMyMangaDetail(id: string): Promise<MangaDetail> {
  return apiFetch<MangaDetail>(`/manga/${id}/for-creator`, {}, true);
}

export async function getMyChapters(mangaId: string): Promise<ChapterListItem[]> {
  return apiFetch<ChapterListItem[]>(`/manga/${mangaId}/my-chapters`, {}, true);
}

export async function getCreatorStats(): Promise<CreatorStats> {
  return apiFetch<CreatorStats>('/manga/creator-stats', {}, true);
}

export async function getMangaAnalytics(mangaId: string): Promise<MangaAnalytics> {
  return apiFetch<MangaAnalytics>(`/manga/${mangaId}/analytics`, {}, true);
}

export async function updateMangaStatus(
  mangaId: string,
  status: 'draft' | 'published' | 'trashed',
): Promise<MangaListItem> {
  return apiFetch<MangaListItem>(
    `/manga/${mangaId}/status`,
    { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) },
    true,
  );
}

// ─── Manga write endpoints ────────────────────────────────────────────────────

export interface CreateMangaPayload {
  title: string;
  description: string;
  genres?: string[];
  tags?: string[];
  status?: 'ongoing' | 'completed' | 'hiatus';
  origin?: 'Indian' | 'International';
  language?: string;
  isFree?: boolean;
  ageRating?: 'all' | 'teen' | 'mature';
  badge?: 'HOT' | 'NEW' | 'TOP' | null;
  gradientFrom?: string;
  gradientTo?: string;
}

export async function createManga(payload: CreateMangaPayload): Promise<MangaListItem> {
  return apiFetch<MangaListItem>(
    '/manga',
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) },
    true,
  );
}

export async function updateManga(id: string, payload: Partial<CreateMangaPayload>): Promise<MangaListItem> {
  return apiFetch<MangaListItem>(
    `/manga/${id}`,
    { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) },
    true,
  );
}


export async function uploadMangaCover(
  mangaId: string,
  coverFile: File,
  onProgress?: (pct: number) => void,
): Promise<MangaListItem> {
  const token = await getToken();
  const fd = new FormData();
  fd.append('cover', coverFile);
  return xhrUpload<MangaListItem>('POST', `${BASE}/manga/${mangaId}/cover`, fd, token, onProgress);
}

export async function uploadChapter(
  mangaId: string,
  chapterNumber: number,
  chapterTitle: string,
  isFree: boolean,
  pageFiles: File[],
  onProgress?: (pct: number) => void,
): Promise<void> {
  const token = await getToken();
  const fd = new FormData();
  fd.append('chapterNumber', String(chapterNumber));
  fd.append('title', chapterTitle);
  fd.append('isFree', String(isFree));
  pageFiles.forEach((f) => fd.append('pages', f));
  return xhrUpload<void>('POST', `${BASE}/manga/${mangaId}/chapters`, fd, token, onProgress);
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export async function rateManga(mangaId: string, score: number): Promise<RatingResult> {
  return apiFetch<RatingResult>(
    `/manga/${mangaId}/rate`,
    { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ score }) },
    true,
  );
}

export async function getMyRating(mangaId: string): Promise<number | null> {
  const res = await apiFetch<{ score: number | null }>(`/manga/${mangaId}/my-rating`, {}, true);
  return res.score;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export async function getComments(mangaId: string, chapterNumber?: number): Promise<MangaComment[]> {
  const qs = chapterNumber != null ? `?chapter=${chapterNumber}` : '';
  return apiFetch<MangaComment[]>(`/manga/${mangaId}/comments${qs}`);
}

export async function addComment(
  mangaId: string,
  content: string,
  chapterNumber?: number,
  parentId?: string,
): Promise<MangaComment> {
  return apiFetch<MangaComment>(
    `/manga/${mangaId}/comments`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, chapterNumber, parentId }),
    },
    true,
  );
}
