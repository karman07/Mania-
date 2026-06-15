import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  firebaseUid: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  displayName: string;

  @Prop()
  photoURL: string;

  @Prop({ type: String, enum: ['reader', 'creator'], default: null })
  role: string | null;

  @Prop({ type: String })
  username: string;

  @Prop({ type: String })
  dob: string;

  @Prop({ type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'], default: null })
  gender: string | null;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  countryCode: string;

  @Prop({ type: String })
  dialCode: string;

  @Prop({ type: String })
  phone: string;

  @Prop({ type: [String], default: [] })
  favoriteGenres: string[];

  @Prop({ default: false })
  profileCompleted: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
