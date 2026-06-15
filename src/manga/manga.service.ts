import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Manga, MangaDocument } from './schemas/manga.schema';
import { Chapter, ChapterDocument } from './schemas/chapter.schema';
import { Comment, CommentDocument } from './schemas/comment.schema';
import { Rating, RatingDocument } from './schemas/rating.schema';
import { Creator, CreatorDocument } from '../creators/schemas/creator.schema';
import { CreateMangaDto, CreateChapterDto, UpdateMangaDto } from './dto/create-manga.dto';

/** Gradient palette for auto-assigning card colours */
const GRADIENTS: Array<[string, string]> = [
  ['#0f0c29', '#302b63'],
  ['#6b2fa0', '#c471ed'],
  ['#1a472a', '#2d6a4f'],
  ['#2c3e50', '#3498db'],
  ['#7b0000', '#1a0000'],
  ['#000428', '#004e92'],
  ['#7d5a1e', '#c8860a'],
  ['#e65c00', '#f9d423'],
  ['#0d0d0d', '#434343'],
  ['#c94b4b', '#4b134f'],
  ['#373b44', '#4286f4'],
  ['#355c7d', '#6c5b7b'],
  ['#0f2027', '#203a43'],
  ['#4a1942', '#c04848'],
  ['#8e0e00', '#1f1c18'],
  ['#ff6a00', '#ee0979'],
  ['#134e5e', '#71b280'],
  ['#200122', '#6f0000'],
  ['#005c97', '#363795'],
];

function pickGradient(index: number): [string, string] {
  return GRADIENTS[index % GRADIENTS.length];
}

@Injectable()
export class MangaService {
  constructor(
    @InjectModel(Manga.name) private mangaModel: Model<MangaDocument>,
    @InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
  ) {}

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async resolveCreatorId(firebaseUid: string): Promise<Types.ObjectId> {
    const creator = await this.creatorModel
      .findOne({ firebaseUid })
      .select('_id')
      .lean();
    if (!creator) throw new ForbiddenException('Creator profile not found');
    return creator._id as Types.ObjectId;
  }

  private async assertOwner(
    mangaId: string,
    creatorId: Types.ObjectId,
  ): Promise<MangaDocument> {
    const manga = await this.mangaModel.findById(mangaId);
    if (!manga) throw new NotFoundException('Manga not found');
    if (!manga.creatorId.equals(creatorId)) {
      throw new ForbiddenException('You do not own this manga');
    }
    return manga;
  }

  // ─── Create manga record ─────────────────────────────────────────────────────

  async create(dto: CreateMangaDto, firebaseUid: string): Promise<Manga> {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const count = await this.mangaModel.countDocuments({ creatorId });
    const [gradFrom, gradTo] = pickGradient(count);

    const manga = await this.mangaModel.create({
      creatorId,
      title: dto.title.trim(),
      description: dto.description.trim(),
      genres: dto.genres ?? [],
      tags: dto.tags ?? [],
      status: dto.status ?? 'ongoing',
      origin: dto.origin ?? 'Indian',
      language: dto.language ?? 'English',
      isFree: dto.isFree ?? false,
      ageRating: dto.ageRating ?? 'all',
      badge: dto.badge ?? null,
      gradientFrom: dto.gradientFrom ?? gradFrom,
      gradientTo: dto.gradientTo ?? gradTo,
      isPublished: false,
      publishedStatus: 'draft',
    });

    return manga;
  }

  // ─── Upload cover image ──────────────────────────────────────────────────────

  async uploadCover(
    mangaId: string,
    filePath: string,
    firebaseUid: string,
  ): Promise<Manga> {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const manga = await this.assertOwner(mangaId, creatorId);

    manga.coverImage = filePath;
    manga.isPublished = true;
    manga.publishedStatus = 'published';
    await manga.save();
    return manga;
  }

  // ─── Update manga status ─────────────────────────────────────────────────────

  async updateStatus(
    mangaId: string,
    newStatus: 'draft' | 'published' | 'trashed',
    firebaseUid: string,
  ): Promise<Manga> {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const manga = await this.assertOwner(mangaId, creatorId);
    manga.publishedStatus = newStatus;
    manga.isPublished = newStatus === 'published';
    await manga.save();
    return manga;
  }

  // ─── Update manga metadata ───────────────────────────────────────────────────

  async updateManga(
    mangaId: string,
    dto: UpdateMangaDto,
    firebaseUid: string,
  ): Promise<Manga> {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const manga = await this.assertOwner(mangaId, creatorId);

    const allowed: Array<keyof UpdateMangaDto> = [
      'title', 'description', 'genres', 'tags', 'status', 'origin',
      'language', 'isFree', 'ageRating', 'badge', 'gradientFrom', 'gradientTo',
    ];
    for (const key of allowed) {
      if (dto[key] !== undefined) {
        (manga as any)[key] = dto[key];
      }
    }
    await manga.save();
    return manga;
  }

  // ─── Add chapter with pages ──────────────────────────────────────────────────


  async addChapter(
    mangaId: string,
    dto: CreateChapterDto,
    pageFilePaths: string[],
    firebaseUid: string,
  ): Promise<Chapter> {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    await this.assertOwner(mangaId, creatorId);

    const existing = await this.chapterModel.findOne({
      mangaId: new Types.ObjectId(mangaId),
      chapterNumber: dto.chapterNumber,
    });
    if (existing) {
      throw new ConflictException(
        `Chapter ${dto.chapterNumber} already exists for this manga`,
      );
    }

    const chapter = await this.chapterModel.create({
      mangaId: new Types.ObjectId(mangaId),
      chapterNumber: Number(dto.chapterNumber),
      title: dto.title?.trim() ?? '',
      pages: pageFilePaths,
      pageCount: pageFilePaths.length,
      isFree: dto.isFree ?? null,
    });

    await this.mangaModel.findByIdAndUpdate(mangaId, {
      $inc: { chapterCount: 1 },
    });

    return chapter;
  }

  // ─── Increment view count ────────────────────────────────────────────────────

  async incrementView(mangaId: string): Promise<void> {
    await this.mangaModel.findByIdAndUpdate(mangaId, {
      $inc: { viewCount: 1 },
    });
  }

  // ─── Browse / listing ────────────────────────────────────────────────────────

  async findAll(query: {
    genre?: string;
    status?: string;
    free?: string;
    search?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    const filter: Record<string, unknown> = { isPublished: true };

    if (query.genre && query.genre !== 'All') filter.genres = query.genre;
    if (query.status) filter.status = query.status;
    if (query.free === 'true') filter.isFree = true;
    if (query.search?.trim()) filter.$text = { $search: query.search.trim() };

    let sortOpt: Record<string, number> = { viewCount: -1, rating: -1 };
    if (query.sort === 'Latest') sortOpt = { createdAt: -1 };
    if (query.sort === 'Top Rated') sortOpt = { rating: -1, ratingCount: -1 };
    if (query.sort === 'Free First') sortOpt = { isFree: -1, viewCount: -1 };

    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? '24', 10)));
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.mangaModel
        .find(filter)
        .sort(sortOpt as any)
        .skip(skip)
        .limit(limit)
        .populate('creatorId', 'penName photoURL')
        .lean(),
      this.mangaModel.countDocuments(filter),
    ]);

    return { data: docs, total, page, limit, pages: Math.ceil(total / limit) };
  }

  // ─── Featured (homepage) ─────────────────────────────────────────────────────

  async findFeatured(): Promise<Manga[]> {
    return this.mangaModel
      .find({ isPublished: true })
      .sort({ rating: -1, viewCount: -1 })
      .limit(8)
      .populate('creatorId', 'penName photoURL')
      .lean();
  }

  // ─── Stats ───────────────────────────────────────────────────────────────────

  async getStats() {
    const [mangaCount, creatorCount] = await Promise.all([
      this.mangaModel.countDocuments({ isPublished: true }),
      this.creatorModel.countDocuments({ status: 'approved' }),
    ]);
    return { mangaCount, creatorCount };
  }

  // ─── Creator dashboard stats ─────────────────────────────────────────────────

  async getCreatorStats(firebaseUid: string) {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const myManga = await this.mangaModel
      .find({ creatorId })
      .select('viewCount chapterCount rating ratingCount title publishedStatus')
      .lean();

    const totalViews = myManga.reduce((s, m) => s + (m.viewCount ?? 0), 0);
    const totalChapters = myManga.reduce(
      (s, m) => s + (m.chapterCount ?? 0),
      0,
    );
    const published = myManga.filter((m) => m.publishedStatus === 'published').length;
    const drafts = myManga.filter((m) => m.publishedStatus === 'draft').length;

    return {
      totalManga: myManga.length,
      published,
      drafts,
      totalViews,
      totalChapters,
      topManga: myManga
        .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
        .slice(0, 5),
    };
  }

  // ─── Single manga detail ─────────────────────────────────────────────────────

  async findOne(mangaId: string) {
    const manga = await this.mangaModel
      .findOne({ _id: mangaId, isPublished: true })
      .populate('creatorId', 'penName photoURL bio genres')
      .lean();
    if (!manga) throw new NotFoundException('Manga not found');
    return manga;
  }

  // ─── Single manga for creator (any status) ────────────────────────────────────

  async findOneForCreator(mangaId: string, firebaseUid: string) {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const manga = await this.mangaModel
      .findById(mangaId)
      .populate('creatorId', 'penName photoURL bio genres')
      .lean();
    if (!manga) throw new NotFoundException('Manga not found');
    const cid = (manga.creatorId as any)?._id ?? manga.creatorId;
    if (!new Types.ObjectId(cid).equals(creatorId)) {
      throw new ForbiddenException('You do not own this manga');
    }
    return manga;
  }

  // ─── Creator analytics for a manga ───────────────────────────────────────────

  async getMangaAnalytics(mangaId: string, firebaseUid: string) {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const manga = await this.assertOwner(mangaId, creatorId);

    const chapters = await this.chapterModel
      .find({ mangaId: new Types.ObjectId(mangaId) })
      .select('chapterNumber title viewCount pageCount createdAt')
      .sort({ chapterNumber: 1 })
      .lean();

    // Generate a simple 30-day view trend (evenly distributed for now)
    // In production you'd store daily snapshots in an AnalyticsEvent collection
    const today = new Date();
    const viewsOverTime = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (29 - i));
      const approxViews = Math.floor(
        ((manga.viewCount ?? 0) / 30) * (0.5 + Math.random()),
      );
      return {
        date: d.toISOString().split('T')[0],
        views: approxViews,
      };
    });

    return {
      mangaId,
      title: manga.title,
      totalViews: manga.viewCount,
      rating: manga.rating,
      ratingCount: manga.ratingCount,
      chapterCount: manga.chapterCount,
      chapters: chapters.map((c) => ({
        chapterNumber: c.chapterNumber,
        title: c.title,
        views: c.viewCount,
        pageCount: c.pageCount,
        createdAt: (c as any).createdAt,
      })),
      viewsOverTime,
    };
  }

  // ─── All manga by a creator (public) ─────────────────────────────────────────

  async findByCreator(creatorId: string) {
    return this.mangaModel
      .find({ creatorId: new Types.ObjectId(creatorId), isPublished: true })
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── My manga (creator dashboard) ───────────────────────────────────────────

  async findMyManga(firebaseUid: string, statusFilter?: string) {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    const filter: Record<string, unknown> = { creatorId };
    if (statusFilter && ['draft', 'published', 'trashed'].includes(statusFilter)) {
      filter.publishedStatus = statusFilter;
    }
    return this.mangaModel.find(filter).sort({ updatedAt: -1 }).lean();
  }

  // ─── Chapter list (public) ────────────────────────────────────────────────────

  async findChapters(mangaId: string) {
    const manga = await this.mangaModel
      .findOne({ _id: mangaId, isPublished: true })
      .select('_id')
      .lean();
    if (!manga) throw new NotFoundException('Manga not found');
    return this.chapterModel
      .find({ mangaId: new Types.ObjectId(mangaId) })
      .sort({ chapterNumber: 1 })
      .select('-pages')
      .lean();
  }

  // ─── Chapters for creator (any status) ────────────────────────────────────────

  async findMyChapters(mangaId: string, firebaseUid: string) {
    const creatorId = await this.resolveCreatorId(firebaseUid);
    await this.assertOwner(mangaId, creatorId);
    return this.chapterModel
      .find({ mangaId: new Types.ObjectId(mangaId) })
      .sort({ chapterNumber: 1 })
      .select('-pages')
      .lean();
  }

  // ─── Single chapter ───────────────────────────────────────────────────────────

  async findChapter(mangaId: string, chapterNumber: number) {
    const chapter = await this.chapterModel
      .findOne({ mangaId: new Types.ObjectId(mangaId), chapterNumber })
      .lean();
    if (!chapter) throw new NotFoundException('Chapter not found');
    await this.chapterModel.findByIdAndUpdate(chapter._id, {
      $inc: { viewCount: 1 },
    });
    return chapter;
  }

  // ─── RATINGS ─────────────────────────────────────────────────────────────────

  async rateOrUpdate(
    mangaId: string,
    score: number,
    firebaseUid: string,
  ): Promise<{ rating: number; ratingCount: number; userScore: number }> {
    if (score < 1 || score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }

    // Upsert the user's rating
    await this.ratingModel.updateOne(
      { mangaId: new Types.ObjectId(mangaId), userId: firebaseUid },
      { $set: { score } },
      { upsert: true },
    );

    // Recalculate aggregated rating
    const agg = await this.ratingModel.aggregate([
      { $match: { mangaId: new Types.ObjectId(mangaId) } },
      {
        $group: {
          _id: '$mangaId',
          avg: { $avg: '$score' },
          count: { $sum: 1 },
        },
      },
    ]);

    const avg = agg[0]?.avg ?? 0;
    const count = agg[0]?.count ?? 0;
    const rounded = Math.round(avg * 10) / 10;

    await this.mangaModel.findByIdAndUpdate(mangaId, {
      $set: { rating: rounded, ratingCount: count },
    });

    return { rating: rounded, ratingCount: count, userScore: score };
  }

  async getUserRating(
    mangaId: string,
    firebaseUid: string,
  ): Promise<number | null> {
    const r = await this.ratingModel
      .findOne({ mangaId: new Types.ObjectId(mangaId), userId: firebaseUid })
      .lean();
    return r ? r.score : null;
  }

  // ─── COMMENTS ────────────────────────────────────────────────────────────────

  async addComment(
    mangaId: string,
    dto: {
      content: string;
      chapterNumber?: number;
      parentId?: string;
    },
    uid: string,
    displayName: string,
    photoURL?: string,
    isCreatorReply = false,
  ) {
    if (!dto.content?.trim()) throw new BadRequestException('Content required');
    if (dto.content.length > 2000) {
      throw new BadRequestException('Comment too long (max 2000 chars)');
    }

    const comment = await this.commentModel.create({
      mangaId: new Types.ObjectId(mangaId),
      chapterNumber: dto.chapterNumber ?? null,
      userId: uid,
      userDisplayName: displayName,
      userPhotoURL: photoURL ?? null,
      content: dto.content.trim(),
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
      isCreatorReply,
    });

    return comment;
  }

  async getComments(mangaId: string, chapterNumber?: number) {
    const filter: Record<string, unknown> = {
      mangaId: new Types.ObjectId(mangaId),
      parentId: null, // top-level only
    };
    if (chapterNumber != null) {
      filter.chapterNumber = chapterNumber;
    } else {
      filter.chapterNumber = null;
    }

    const topLevel = await this.commentModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Fetch replies for all top-level comments
    const ids = topLevel.map((c) => c._id);
    const replies = await this.commentModel
      .find({ parentId: { $in: ids } })
      .sort({ createdAt: 1 })
      .lean();

    // Nest replies under their parent
    const replyMap = new Map<string, typeof replies>();
    for (const r of replies) {
      const key = r.parentId!.toString();
      if (!replyMap.has(key)) replyMap.set(key, []);
      replyMap.get(key)!.push(r);
    }

    return topLevel.map((c) => ({
      ...c,
      replies: replyMap.get(c._id.toString()) ?? [],
    }));
  }
}
