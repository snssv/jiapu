import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { Favorites } from './favorites.entity';
import {MessageModule} from '../message/message.module';
import {AuthModule} from "../auth/auth.module";
import {ArticleModule} from "../article/article.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Favorites]),
        AuthModule,
        ArticleModule,
        UserModule,
        MessageModule
    ],
    exports:[FavoritesService],
    providers: [FavoritesService],
    controllers: [FavoritesController],
})
export class FavoritesModule {}
