import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Creator, CreatorDocument } from './schemas/creator.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async apply(data: {
    firebaseUid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    penName: string;
    bio: string;
    genres: string[];
    portfolioUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    termsAccepted: boolean;
    privacyAccepted: boolean;
  }): Promise<Creator> {
    const existing = await this.creatorModel.findOne({ firebaseUid: data.firebaseUid });
    if (existing) throw new ConflictException('Already registered as a creator');

    const creator = await this.creatorModel.create({ ...data, status: 'approved' });

    // Promote user role to creator
    await this.userModel.findOneAndUpdate(
      { firebaseUid: data.firebaseUid },
      { $set: { role: 'creator' } },
    );

    return creator;
  }

  async findAll(): Promise<Creator[]> {
    return this.creatorModel
      .find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findByUser(firebaseUid: string): Promise<Creator | null> {
    return this.creatorModel.findOne({ firebaseUid }).lean();
  }
}
