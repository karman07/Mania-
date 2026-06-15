import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MangaDocument = Manga & Document;

@Schema({ timestamps: true })
export class Manga {
  /** Reference to the Creator who owns this manga */
  @Prop({ type: Types.ObjectId, ref: 'Creator', required: true, index: true })
  creatorId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  description: string;

  /** Path to cover image file (set via /manga/:id/cover upload) */
  @Prop({ type: String, default: null })
  coverImage: string | null;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: String,
    enum: ['ongoing', 'completed', 'hiatus'],
    default: 'ongoing',
  })
  status: 'ongoing' | 'completed' | 'hiatus';

  @Prop({
    type: String,
    enum: ['Indian', 'International'],
    default: 'Indian',
  })
  origin: 'Indian' | 'International';

  @Prop({ default: 'English' })
  language: string;

  @Prop({ default: false })
  isFree: boolean;

  @Prop({
    type: String,
    enum: ['all', 'teen', 'mature'],
    default: 'all',
  })
  ageRating: 'all' | 'teen' | 'mature';

  /** Aggregated average rating (0–5) */
  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  /** Number of ratings submitted */
  @Prop({ default: 0, min: 0 })
  ratingCount: number;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  /** Kept in sync whenever a chapter is added */
  @Prop({ default: 0, min: 0 })
  chapterCount: number;

  /** Promotional badge shown on cards */
  @Prop({ type: String, enum: ['HOT', 'NEW', 'TOP', null], default: null })
  badge: 'HOT' | 'NEW' | 'TOP' | null;

  /**
   * Gradient colours used for the card background when no cover image exists.
   * Stored as hex strings, e.g. "#0f0c29".
   */
  @Prop({ default: '#0f0c29' })
  gradientFrom: string;

  @Prop({ default: '#302b63' })
  gradientTo: string;

  /** false = draft, true = visible on browse/featured */
  @Prop({ default: false })
  isPublished: boolean;

  /** Explicit project lifecycle status */
  @Prop({
    type: String,
    enum: ['draft', 'published', 'trashed'],
    default: 'draft',
  })
  publishedStatus: 'draft' | 'published' | 'trashed';
}

export const MangaSchema = SchemaFactory.createForClass(Manga);

// Text index for search
MangaSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Sort indexes
MangaSchema.index({ rating: -1, viewCount: -1 });
MangaSchema.index({ createdAt: -1 });
