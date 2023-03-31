import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ArticleModule } from '../article/article.module';
import { SettingModule } from '../setting/setting.module';
import { SMTPModule } from '../smtp/smtp.module';
import { UserModule } from '../user/user.module';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './comment.entity';
import {MessageModule} from '../message/message.module';
import {PeopleModule} from '../people/people.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Comment]),
        AuthModule,
        ArticleModule,
        PeopleModule,
        SettingModule,
        SMTPModule,
        UserModule,
        MessageModule
    ],
    exports: [CommentService],
    providers: [CommentService],
    controllers: [CommentController],
})
export class CommentModule {}
