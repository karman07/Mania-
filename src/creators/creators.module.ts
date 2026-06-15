import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorsController } from './creators.controller';
import { CreatorsService } from './creators.service';
import { Creator, CreatorSchema } from './schemas/creator.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Creator.name, schema: CreatorSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FirebaseModule,
  ],
  controllers: [CreatorsController],
  providers: [CreatorsService],
})
export class CreatorsModule {}
