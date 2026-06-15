/**
 * Shared TypeScript types that mirror the backend Mongoose schemas.
 * Used across all frontend components and pages.
 */

// ─── Creator ──────────────────────────────────────────────────────────────────

export interface CreatorRef {
  _id: string;
  penName: string;
  photoURL?: string;
}

export interface CreatorFull extends CreatorRef {
  bio: string;
  genres: string[];
  email?: string;
  displayName?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  portfolioUrl?: string;
  status: 'pending' | 'approved';
  createdAt: string;
}

// ─── Manga ────────────────────────────────────────────────────────────────────

export type MangaStatus = 'ongoing' | 'completed' | 'hiatus';
export type MangaOrigin = 'Indian' | 'International';
export type AgeRating = 'all' | 'teen' | 'mature';
export type MangaBadge = 'HOT' | 'NEW' | 'TOP' | null;
export type PublishedStatus = 'draft' | 'published' | 'trashed';

/** Shape returned from list/featured endpoints */
export interface MangaListItem {
  _id: string;
  creatorId: CreatorRef | string;
  title: string;
  description: string;
  coverImage: string | null;
  genres: string[];
  tags: string[];
  status: MangaStatus;
  origin: MangaOrigin;
  language: string;
  isFree: boolean;
  ageRating: AgeRating;
  rating: number;
  ratingCount: number;
  viewCount: number;
  chapterCount: number;
  badge: MangaBadge;
  gradientFrom: string;
  gradientTo: string;
  isPublished: boolean;
  publishedStatus: PublishedStatus;
  createdAt: string;
  updatedAt: string;
}

/** Full detail including populated creator */
export interface MangaDetail extends Omit<MangaListItem, 'creatorId'> {
  creatorId: CreatorRef;
}

// ─── Chapter ──────────────────────────────────────────────────────────────────

export interface ChapterListItem {
  _id: string;
  mangaId: string;
  chapterNumber: number;
  title: string;
  pageCount: number;
  isFree: boolean | null;
  viewCount: number;
  createdAt: string;
}

export interface ChapterFull extends ChapterListItem {
  pages: string[];
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface CommentReply {
  _id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string | null;
  content: string;
  likeCount: number;
  isCreatorReply: boolean;
  createdAt: string;
}

export interface MangaComment extends CommentReply {
  mangaId: string;
  chapterNumber: number | null;
  parentId: string | null;
  replies: CommentReply[];
}

// ─── Ratings ──────────────────────────────────────────────────────────────────

export interface RatingResult {
  rating: number;
  ratingCount: number;
  userScore: number;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface ViewDataPoint {
  date: string;
  views: number;
}

export interface ChapterAnalytics {
  chapterNumber: number;
  title: string;
  views: number;
  pageCount: number;
  createdAt: string;
}

export interface MangaAnalytics {
  mangaId: string;
  title: string;
  totalViews: number;
  rating: number;
  ratingCount: number;
  chapterCount: number;
  chapters: ChapterAnalytics[];
  viewsOverTime: ViewDataPoint[];
}

export interface CreatorStats {
  totalManga: number;
  published: number;
  drafts: number;
  totalViews: number;
  totalChapters: number;
  topManga: Array<{
    _id: string;
    title: string;
    viewCount: number;
    chapterCount: number;
    rating: number;
  }>;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface PaginatedManga {
  data: MangaListItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface MangaStats {
  mangaCount: number;
  creatorCount: number;
}
