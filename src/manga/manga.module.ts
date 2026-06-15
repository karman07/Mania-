import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MangaController } from './manga.controller';
import { MangaService } from './manga.service';
import { Manga, MangaSchema } from './schemas/manga.schema';
import { Chapter, ChapterSchema } from './schemas/chapter.schema';
import { Comment, CommentSchema } from './schemas/comment.schema';
import { Rating, RatingSchema } from './schemas/rating.schema';
import { Creator, CreatorSchema } from '../creators/schemas/creator.schema';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Manga.name, schema: MangaSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Rating.name, schema: RatingSchema },
      { name: Creator.name, schema: CreatorSchema },
    ]),
    FirebaseModule,
  ],
  controllers: [MangaController],
  providers: [MangaService],
  exports: [MangaService],
})
export class MangaModule {}
