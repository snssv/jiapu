import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PeopleModule } from '../people/people.module';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Article } from './article.entity';
import {MessageModule} from '../message/message.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Article]),
        UserModule,
        PeopleModule,
        AuthModule,
        MessageModule,
    ],
    exports: [ArticleService],
    providers: [ArticleService],
    controllers: [ArticleController],
})
export class ArticleModule {}
