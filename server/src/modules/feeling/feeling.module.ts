import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeelingService } from './feeling.service';
import { FeelingController } from './feeling.controller';
import { Feeling } from './feeling.entity';
import {UserModule} from "../user/user.module";
import {ArticleModule} from "../article/article.module";
import {AuthModule} from "../auth/auth.module";
import {CommentModule} from "../comment/comment.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Feeling]),
        AuthModule,
        ArticleModule,
        UserModule,
        CommentModule
    ],
    exports:[FeelingService],
    providers: [FeelingService],
    controllers: [FeelingController],
})
export class FeelingModule {}
