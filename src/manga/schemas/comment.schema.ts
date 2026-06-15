import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  /** The manga this comment belongs to */
  @Prop({ type: Types.ObjectId, ref: 'Manga', required: true, index: true })
  mangaId: Types.ObjectId;

  /**
   * Optional chapter number — null means it is a manga-level comment,
   * a number means it is tied to a specific chapter.
   */
  @Prop({ type: Number, default: null })
  chapterNumber: number | null;

  /** Firebase UID of the commenter */
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userDisplayName: string;

  @Prop({ type: String, default: null })
  userPhotoURL: string | null;

  /** The comment body (max 2000 chars enforced in service) */
  @Prop({ required: true, trim: true, maxlength: 2000 })
  content: string;

  /**
   * If set, this is a reply to another Comment._id.
   * Top-level comments have parentId = null.
   */
  @Prop({ type: Types.ObjectId, ref: 'Comment', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ default: 0, min: 0 })
  likeCount: number;

  /** Marks the comment as coming from the manga's creator — shown with a badge */
  @Prop({ default: false })
  isCreatorReply: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

// Indexes for efficient fetching
CommentSchema.index({ mangaId: 1, chapterNumber: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1 });
