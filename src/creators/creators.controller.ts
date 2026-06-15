import {
  Controller, Post, Get, Body, Headers,
  UnauthorizedException, BadRequestException,
  UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CreatorsService } from './creators.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('creators')
export class CreatorsController {
  constructor(
    private readonly creatorsService: CreatorsService,
    private readonly firebaseService: FirebaseService,
  ) {}

  private async getDecoded(authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    return this.firebaseService.verifyToken(token);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = 'uploads/creators';
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new BadRequestException('Only image files are allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPhoto(
    @Headers('authorization') auth: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    await this.getDecoded(auth);
    if (!file) throw new BadRequestException('No file provided');
    return { photoURL: `/uploads/creators/${file.filename}` };
  }

  @Post('apply')
  async apply(
    @Headers('authorization') auth: string,
    @Body() body: {
      penName: string;
      bio: string;
      genres?: string[];
      portfolioUrl?: string;
      instagramUrl?: string;
      twitterUrl?: string;
      photoURL?: string;
      termsAccepted: boolean;
      privacyAccepted: boolean;
    },
  ) {
    if (!body.termsAccepted || !body.privacyAccepted) {
      throw new BadRequestException('Must accept Terms of Service and Privacy Policy');
    }
    if (!body.penName?.trim() || !body.bio?.trim()) {
      throw new BadRequestException('Pen name and bio are required');
    }

    const decoded = await this.getDecoded(auth);
    return this.creatorsService.apply({
      firebaseUid: decoded.uid,
      displayName: decoded.name,
      email: decoded.email,
      photoURL: body.photoURL || decoded.picture,
      penName: body.penName.trim(),
      bio: body.bio.trim(),
      genres: body.genres ?? [],
      portfolioUrl: body.portfolioUrl?.trim(),
      instagramUrl: body.instagramUrl?.trim(),
      twitterUrl: body.twitterUrl?.trim(),
      termsAccepted: body.termsAccepted,
      privacyAccepted: body.privacyAccepted,
    });
  }

  @Get()
  async findAll() {
    return this.creatorsService.findAll();
  }

  @Get('me')
  async getMe(@Headers('authorization') auth: string) {
    const decoded = await this.getDecoded(auth);
    return this.creatorsService.findByUser(decoded.uid);
  }
}
