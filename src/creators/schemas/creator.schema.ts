import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CreatorDocument = Creator & Document;

@Schema({ timestamps: true })
export class Creator {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop()
  displayName: string;

  @Prop()
  email: string;

  @Prop()
  photoURL: string;

  @Prop({ required: true })
  penName: string;

  @Prop({ required: true })
  bio: string;

  @Prop({ type: [String], default: [] })
  genres: string[];

  @Prop()
  portfolioUrl: string;

  @Prop()
  instagramUrl: string;

  @Prop()
  twitterUrl: string;

  @Prop({ required: true, default: false })
  termsAccepted: boolean;

  @Prop({ required: true, default: false })
  privacyAccepted: boolean;

  @Prop({ type: String, enum: ['pending', 'approved'], default: 'approved' })
  status: string;
}

export const CreatorSchema = SchemaFactory.createForClass(Creator);
