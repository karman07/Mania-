import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async syncUser(data: {
    firebaseUid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  }): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { firebaseUid: data.firebaseUid },
      { $setOnInsert: { ...data, role: null, profileCompleted: false } },
      { upsert: true, new: true },
    );
  }

  async updateProfile(
    firebaseUid: string,
    data: {
      role?: string; displayName?: string; photoURL?: string;
      username?: string; dob?: string; gender?: string;
      country?: string; countryCode?: string; dialCode?: string;
      phone?: string; favoriteGenres?: string[]; profileCompleted?: boolean;
    },
  ): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { firebaseUid },
      { $set: data },
      { new: true },
    );
  }

  async findByUid(firebaseUid: string): Promise<User | null> {
    return this.userModel.findOne({ firebaseUid });
  }
}
