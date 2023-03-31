import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ArticleModule } from '../article/article.module';
import { SettingModule } from '../setting/setting.module';
import { SMTPModule } from '../smtp/smtp.module';
import { UserModule } from '../user/user.module';
import { ManageService } from './manage.service';
import { ManageController } from './manage.controller';
import { Manage } from './manage.entity';
import {MessageModule} from '../message/message.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Manage]),
        AuthModule,
        ArticleModule,
        SettingModule,
        SMTPModule,
        UserModule,
        MessageModule
    ],
    exports: [ManageService],
    providers: [ManageService],
    controllers: [ManageController],
})
export class ManageModule {}
