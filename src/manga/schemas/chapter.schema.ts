import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChapterDocument = Chapter & Document;

@Schema({ timestamps: true })
export class Chapter {
  /** Parent manga */
  @Prop({ type: Types.ObjectId, ref: 'Manga', required: true, index: true })
  mangaId: Types.ObjectId;

  /** 1-based chapter number — unique per manga */
  @Prop({ required: true, min: 1 })
  chapterNumber: number;

  @Prop({ default: '' })
  title: string;

  /**
   * Ordered array of relative file paths for every page image.
   * e.g. ["/uploads/manga/pages/<mangaId>/chapter-1/001.jpg", ...]
   * Supports hundreds to thousands of entries.
   */
  @Prop({ type: [String], default: [] })
  pages: string[];

  /** Derived from pages.length — stored for quick lookup */
  @Prop({ default: 0, min: 0 })
  pageCount: number;

  /** Per-chapter free override (falls back to manga.isFree if undefined) */
  @Prop({ type: Boolean, default: null })
  isFree: boolean | null;

  @Prop({ default: 0, min: 0 })
  viewCount: number;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);

// Unique compound index: one chapter number per manga
ChapterSchema.index({ mangaId: 1, chapterNumber: 1 }, { unique: true });
