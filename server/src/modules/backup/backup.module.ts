import {forwardRef, Module} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ArticleModule } from '../article/article.module';
import { UserModule } from '../user/user.module';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { Backup } from './backup.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Backup]),
        AuthModule,
        ArticleModule,
        UserModule,
    ],
    exports: [BackupService],
    providers: [BackupService],
    controllers: [BackupController],
})
export class BackupModule {}
