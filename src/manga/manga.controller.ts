import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Headers,
  Param,
  Query,
  UnauthorizedException,
  BadRequestException,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { MangaService } from './manga.service';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateMangaDto, CreateChapterDto, UpdateMangaDto } from './dto/create-manga.dto';

const IMAGE_MIME = /^image\/(jpeg|jpg|png|webp|gif|avif)$/;

function pageName(index: number, originalName: string): string {
  const pad = String(index + 1).padStart(4, '0');
  return `${pad}${extname(originalName)}`;
}

@Controller('manga')
export class MangaController {
  constructor(
    private readonly mangaService: MangaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  // ─── Auth helper ──────────────────────────────────────────────────────────────

  private async getDecoded(authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException('No auth token');
    return this.firebaseService.verifyToken(token);
  }

  // ─── POST /manga ──────────────────────────────────────────────────────────────

  @Post()
  async create(
    @Headers('authorization') auth: string,
    @Body() body: CreateMangaDto,
  ) {
    if (!body.title?.trim()) throw new BadRequestException('Title is required');
    if (!body.description?.trim())
      throw new BadRequestException('Description is required');
    const dec = await this.getDecoded(auth);
    return this.mangaService.create(body, dec.uid);
  }

  // ─── POST /manga/:id/cover ────────────────────────────────────────────────────

  @Post(':id/cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = `uploads/manga/covers`;
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_MIME.test(file.mimetype))
          return cb(new BadRequestException('Only images allowed'), false);
        cb(null, true);
      },
    }),
  )
  async uploadCover(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No cover file provided');
    const dec = await this.getDecoded(auth);
    return this.mangaService.uploadCover(
      id,
      `/uploads/manga/covers/${file.filename}`,
      dec.uid,
    );
  }

  // ─── POST /manga/:id/chapters ─────────────────────────────────────────────────

  @Post(':id/chapters')
  @UseInterceptors(
    FilesInterceptor('pages', 1000, {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const mangaId = req.params.id;
          const chNum = req.body?.chapterNumber ?? '0';
          const dest = `uploads/manga/pages/${mangaId}/chapter-${chNum}`;
          if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (req, file, cb) => {
          if ((req as any).__pageIndex === undefined)
            (req as any).__pageIndex = 0;
          cb(null, pageName((req as any).__pageIndex++, file.originalname));
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024, files: 1000 },
      fileFilter: (_req, file, cb) => {
        if (!IMAGE_MIME.test(file.mimetype))
          return cb(new BadRequestException('Only images allowed'), false);
        cb(null, true);
      },
    }),
  )
  async uploadChapter(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { chapterNumber: string; title?: string; isFree?: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!body.chapterNumber)
      throw new BadRequestException('chapterNumber is required');
    if (!files?.length) throw new BadRequestException('No pages uploaded');
    const dec = await this.getDecoded(auth);
    const chapterNum = parseInt(body.chapterNumber, 10);
    if (isNaN(chapterNum) || chapterNum < 1)
      throw new BadRequestException('chapterNumber must be ≥ 1');
    const paths = files.map(
      (f) => `/uploads/manga/pages/${id}/chapter-${chapterNum}/${f.filename}`,
    );
    const dto: CreateChapterDto = {
      chapterNumber: chapterNum,
      title: body.title,
      isFree:
        body.isFree === 'true' ? true : body.isFree === 'false' ? false : null,
    };
    return this.mangaService.addChapter(id, dto, paths, dec.uid);
  }

  // ─── GET /manga ───────────────────────────────────────────────────────────────

  @Get()
  async findAll(
    @Query('genre') genre?: string,
    @Query('status') status?: string,
    @Query('free') free?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mangaService.findAll({ genre, status, free, search, sort, page, limit });
  }

  // ─── GET /manga/featured ──────────────────────────────────────────────────────

  @Get('featured')
  async findFeatured() {
    return this.mangaService.findFeatured();
  }

  // ─── GET /manga/stats ─────────────────────────────────────────────────────────

  @Get('stats')
  async getStats() {
    return this.mangaService.getStats();
  }

  // ─── GET /manga/creator-stats ─────────────────────────────────────────────────

  @Get('creator-stats')
  async getCreatorStats(@Headers('authorization') auth: string) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.getCreatorStats(dec.uid);
  }

  // ─── GET /manga/my ────────────────────────────────────────────────────────────

  @Get('my')
  async getMyManga(
    @Headers('authorization') auth: string,
    @Query('status') status?: string,
  ) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.findMyManga(dec.uid, status);
  }

  // ─── GET /manga/creator/:creatorId ────────────────────────────────────────────

  @Get('creator/:creatorId')
  async findByCreator(@Param('creatorId') creatorId: string) {
    return this.mangaService.findByCreator(creatorId);
  }

  // ─── PATCH /manga/:id ─────────────────────────────────────────────────────────

  @Patch(':id')
  async updateManga(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: UpdateMangaDto,
  ) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.updateManga(id, body, dec.uid);
  }

  // ─── GET /manga/:id ───────────────────────────────────────────────────────────


  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.mangaService.findOne(id);
  }

  // ─── GET /manga/:id/for-creator ───────────────────────────────────────────────

  @Get(':id/for-creator')
  async findOneForCreator(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.findOneForCreator(id, dec.uid);
  }

  // ─── PATCH /manga/:id/view ────────────────────────────────────────────────────

  @Patch(':id/view')
  async incrementView(@Param('id') id: string) {
    await this.mangaService.incrementView(id);
    return { ok: true };
  }

  // ─── PATCH /manga/:id/status ──────────────────────────────────────────────────

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { status: 'draft' | 'published' | 'trashed' },
  ) {
    if (!['draft', 'published', 'trashed'].includes(body.status)) {
      throw new BadRequestException('Invalid status');
    }
    const dec = await this.getDecoded(auth);
    return this.mangaService.updateStatus(id, body.status, dec.uid);
  }

  // ─── GET /manga/:id/chapters ──────────────────────────────────────────────────

  @Get(':id/chapters')
  async findChapters(@Param('id') id: string) {
    return this.mangaService.findChapters(id);
  }

  // ─── GET /manga/:id/my-chapters ───────────────────────────────────────────────

  @Get(':id/my-chapters')
  async findMyChapters(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.findMyChapters(id, dec.uid);
  }

  // ─── GET /manga/:id/chapters/:num ────────────────────────────────────────────

  @Get(':id/chapters/:num')
  async findChapter(
    @Param('id') id: string,
    @Param('num', ParseIntPipe) num: number,
  ) {
    return this.mangaService.findChapter(id, num);
  }

  // ─── GET /manga/:id/analytics ─────────────────────────────────────────────────

  @Get(':id/analytics')
  async getMangaAnalytics(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.getMangaAnalytics(id, dec.uid);
  }

  // ─── POST /manga/:id/rate ─────────────────────────────────────────────────────

  @Post(':id/rate')
  async rateManga(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { score: number },
  ) {
    const dec = await this.getDecoded(auth);
    return this.mangaService.rateOrUpdate(id, Number(body.score), dec.uid);
  }

  // ─── GET /manga/:id/my-rating ─────────────────────────────────────────────────

  @Get(':id/my-rating')
  async getMyRating(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const dec = await this.getDecoded(auth);
    const score = await this.mangaService.getUserRating(id, dec.uid);
    return { score };
  }

  // ─── POST /manga/:id/comments ─────────────────────────────────────────────────

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body()
    body: {
      content: string;
      chapterNumber?: number;
      parentId?: string;
    },
  ) {
    const dec = await this.getDecoded(auth);
    // Determine if this user is the manga's creator
    const manga = await this.mangaService.findOne(id).catch(() => null);
    const mangaCreatorUid = (manga?.creatorId as any)?.firebaseUid;
    const isCreatorReply = mangaCreatorUid === dec.uid;

    return this.mangaService.addComment(
      id,
      body,
      dec.uid,
      dec.name ?? dec.email ?? 'Reader',
      dec.picture,
      isCreatorReply,
    );
  }

  // ─── GET /manga/:id/comments ──────────────────────────────────────────────────

  @Get(':id/comments')
  async getComments(
    @Param('id') id: string,
    @Query('chapter') chapter?: string,
  ) {
    const chNum = chapter ? parseInt(chapter, 10) : undefined;
    return this.mangaService.getComments(id, isNaN(chNum!) ? undefined : chNum);
  }
}
