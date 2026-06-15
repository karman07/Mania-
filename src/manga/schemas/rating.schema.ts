import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @Prop({ type: Types.ObjectId, ref: 'Manga', required: true, index: true })
  mangaId: Types.ObjectId;

  /** Firebase UID of the reader */
  @Prop({ required: true })
  userId: string;

  /** Integer 1–5 */
  @Prop({ required: true, min: 1, max: 5 })
  score: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);

// One rating per user per manga
RatingSchema.index({ mangaId: 1, userId: 1 }, { unique: true });
