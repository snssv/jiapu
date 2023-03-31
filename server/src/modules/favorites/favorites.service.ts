import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Favorites } from './favorites.entity';
// import {ArticleService} from "../article/article.service";


@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorites)
        private readonly favoritesRepository: Repository<Favorites>,
        private readonly userService: UserService,
        // private readonly articleService: ArticleService,
    ) {}

    /**
     * 创建评论
     * @param favorites
     */
    async create(
        userId = 'visitors1984',
        favorites: Partial<Favorites> & { reply?: string; createByAdmin?: boolean }
    ): Promise<Favorites> {
        const { article } = favorites;

        if (!article ) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }


        // favorites.userAgent = parseUserAgent(userAgent);
        let existArticle = await this.findByArticle(article);
        // console.log(existArticle)
        if (existArticle[1]>0) {
            throw new HttpException('收藏过了', HttpStatus.BAD_REQUEST);
        }
        let existUser = await this.userService.findById(userId);
        // console.log(existUser);
        const newFavorites = await this.favoritesRepository.create({
            ...favorites,
            user: existUser
        });
        await this.favoritesRepository.save(newFavorites);

        delete newFavorites.user.mobile;
        delete newFavorites.user.email;
        delete newFavorites.user.device;
        delete newFavorites.user.ip;
        delete newFavorites.user.username;
        delete newFavorites.user.password;

        return newFavorites;
    }

    /**
     * 查询所有评论
     * 额外添加家谱信息
     */
    async findAll(queryParams: any = {},userId=null): Promise<[Favorites[], number]> {
        const query = this.favoritesRepository
            .createQueryBuilder('favorites')
            .leftJoinAndSelect('favorites.article','article')
            .orderBy('favorites.createAt', 'DESC');

        const { page = 1, pageSize = 30, pass, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);


        if (userId) {
            query
                .andWhere(`favorites.user=:id`)
                .setParameter('id', userId);
        }
        if (!userId) {
            query.leftJoinAndSelect('favorites.user', 'user')
        }

        return query.getManyAndCount();
    }

    async findByArticle(id): Promise<[Favorites[], number]> {
        const query = this.favoritesRepository
            .createQueryBuilder('favorites')
            .where('favorites.article=:id')
            .setParameter('id',id)

        return query.getManyAndCount();
    }


    async deleteById(favorites) {
        const { id } = favorites;
        if (!id ) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        const data = await this.favoritesRepository.findOne(id);
        this.favoritesRepository.remove(data)
        return {msg:'OK'};
    }
}
