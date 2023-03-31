import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './modules/chat/chat.module';
import { FriendModule } from './modules/friend/friend.module';
import { GroupModule } from './modules/group/group.module';
// 鉴权模块
import { AuthModule } from './modules/auth/auth.module';
// 用户模块
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/user.entity';

// 文件模块
import { FileModule } from './modules/file/file.module';
import { File } from './modules/file/file.entity';
// 家谱模块
import { ArticleModule } from './modules/article/article.module';
import { Article } from './modules/article/article.entity';
// 家谱模块
import { PeopleModule } from './modules/people/people.module';
import { People } from './modules/people/people.entity';
// 评论模块
import { CommentModule } from './modules/comment/comment.module';
import { Comment } from './modules/comment/comment.entity';
// 系统模块
import { SettingModule } from './modules/setting/setting.module';
import { Setting } from './modules/setting/setting.entity';
// 邮件模块
import { SMTPModule } from './modules/smtp/smtp.module';
import { SMTP } from './modules/smtp/smtp.entity';
// 访问统计模块
import { ViewModule } from './modules/view/view.module';
import { View } from './modules/view/view.entity';
// 搜索模块
import { Search } from './modules/search/search.entity';
import { SearchModule } from './modules/search/search.module';
// 配置文件
import { config } from './config';
import { FeelingModule } from './modules/feeling/feeling.module';
import { FollowsModule } from './modules/follows/follows.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { MessageModule } from './modules/message/message.module';
import {Message} from './modules/message/message.entity';
import {Follows} from './modules/follows/follows.entity';
import {Feeling} from './modules/feeling/feeling.entity';
import {Favorites} from './modules/favorites/favorites.entity';
import {VerificationCode} from './modules/user/verification-code.entity';
import {VerificationCodeModule} from './modules/user/verification-code.module';
import {Group, GroupMap} from './modules/group/group.entity';
import {GroupMessage} from './modules/group/groupMessage.entity';
import {FriendMap} from './modules/friend/friend.entity';
import {FriendMessage} from './modules/friend/friendMessage.entity';
import {Manage} from './modules/manage/manage.entity';
import {ManageModule} from './modules/manage/manage.module';
import {Backup} from './modules/backup/backup.entity';
import {BackupModule} from './modules/backup/backup.module';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            ...config.mysql,
            entities: [
                User,
                File,
                Article,
                Backup,
                People,
                Comment,
                Setting,
                SMTP,
                View,
                Search,
                Manage,
                Message,
                Follows,
                Feeling,
                Group,
                GroupMap,
                GroupMessage,
                FriendMap,
                FriendMessage,
                Favorites,
                VerificationCode,
            ],
            synchronize: true,
        }),
        UserModule,
        FileModule,
        ArticleModule,
        BackupModule,
        PeopleModule,
        CommentModule,
        SettingModule,
        SMTPModule,
        AuthModule,
        ViewModule,
        SearchModule,
        FeelingModule,
        FollowsModule,
        FavoritesModule,
        ManageModule,
        MessageModule,
        VerificationCodeModule,
        ChatModule,
        FriendModule,
        GroupModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
