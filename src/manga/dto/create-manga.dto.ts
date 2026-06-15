/** DTO for POST /manga (create a new manga record) */
export class CreateMangaDto {
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

/** DTO for POST /manga/:id/chapters (add a chapter record — pages are the uploaded files) */
export class CreateChapterDto {
  chapterNumber: number;
  title?: string;
  isFree?: boolean | null;
}

/** DTO for PATCH /manga/:id (update an existing manga — all fields optional) */
export class UpdateMangaDto {
  title?: string;
  description?: string;
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
