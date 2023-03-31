import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { Article } from './article.entity';
import {JwtService} from '@nestjs/jwt';
import {PeopleService} from '../people/people.service';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(Article)
        private readonly articleRepository: Repository<Article>,
        private readonly userService: UserService,
        private readonly peopleService: PeopleService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * 创建家谱
     * @param article
     */
    async create(req, article: Partial<Article>, existUser = null): Promise<Article> {
        const newArticle = await this.articleRepository.create({
            ...article,
            user: existUser,
            private: article.privateCode ? true : false,
        });
        await this.articleRepository.save(newArticle);
        if (existUser) {
            // 不是游客，加分
            existUser.integral += 5;
            existUser.coin += 1;
            this.userService.updateById(existUser.id, existUser);
        }
        const ancestor = await this.peopleService.create({
            name: newArticle.ancestor,
            clan: newArticle.clan,
            address: newArticle.address,
            lat: newArticle.lat,
            lng: newArticle.lng,
            device: newArticle.device,
            birthAt: -20689344000000,
            catalog: newArticle.id,
        }, existUser);
        const oldArticle = await this.articleRepository.findOne(newArticle.id);
        const new2Article = {
            ...newArticle,
            ancestorId: ancestor.id,
        };
        const updatedArticle = await this.articleRepository.merge(
            oldArticle,
            new2Article,
        );
        return this.articleRepository.save(updatedArticle);
    }

    /**
     * 更新指定家谱
     * @param id
     * @param article
     */
    async updateById(id, article: Partial<Article>): Promise<Article> {
        const oldArticle = await this.articleRepository.findOne(id);
        const newArticle = {
            ancestor: article.ancestor,
            seniority: article.seniority,
            tree: article.tree,
            clan: article.clan,
            cover: article.cover,
            lat: article.lat,
            lng: article.lng,
            address: article.address,
            content: article.content,
            privateCode: article.privateCode,
            private: article.privateCode ? true : false,
            views: oldArticle.views,
        };

        const updatedArticle = await this.articleRepository.merge(
            oldArticle,
            newArticle,
        );
        return this.articleRepository.save(updatedArticle);
    }

    async updateByIdAdmin(id, article: Partial<Article>): Promise<Article> {
        const oldArticle = await this.articleRepository.findOne(id);
        const newArticle = {
            status: article.status,
            seniority: article.seniority,
            tree: article.tree,
            clan: article.clan,
            cover: article.cover,
            lat: article.lat,
            lng: article.lng,
            address: article.address,
            content: article.content,
            manageId: article.manageId,
            privateCode: article.privateCode,
            private: article.privateCode ? true : false,
            views: oldArticle.views,
        };

        const updatedArticle = await this.articleRepository.merge(
            oldArticle,
            newArticle,
        );
        return this.articleRepository.save(updatedArticle);
    }

    /**
     * 获取所有家谱
     */
    async findAll(queryParams: any = {}, userId = null, isAdmin= false): Promise<[Article[], number]> {
        const query = this.articleRepository.createQueryBuilder('article');

        // console.log(userId);
        if (queryParams.area) {
            const fwR = [5, 100, 500, 1000, 2000, 50000];
            query.where('sqrt( ( ((:lng-lng)*PI()*12656*cos(((:lat+lat)/2)*PI()/180)/180) * ((:lng-lng)*PI()*12656*cos (((:lat+lat)/2)*PI()/180)/180) ) + ( ((:lat-lat)*PI()*12656/180) * ((:lat-lat)*PI()*12656/180) ) )< :area')
                .setParameter('lat', queryParams.lat)
                .setParameter('lng', queryParams.lng)
                .setParameter('area', fwR[queryParams.area]);
        }
        if (queryParams.key) {
            query.andWhere('article.ancestor LIKE :key OR article.content LIKE :key OR article.address LIKE :key')
                .setParameter('key', '%' + queryParams.key + '%');
        }
        if (queryParams.manageId) {
            query.andWhere('article.manageId LIKE :key')
                .setParameter('key', '%' + queryParams.manageId + '%');
        }
        if (userId) {
            query.andWhere('article.userId=:userId').setParameter('userId', userId);
        }
        if (!isAdmin) {
            query.andWhere('article.private=0');
        } else {
            query.leftJoinAndSelect('article.user', 'user');
        }
        if (queryParams.start || queryParams.end) {
            const now = new Date();
            query.andWhere('article.createAt >= :start and article.createAt <= :end')
                .setParameter('start', new Date(Number(queryParams.start)) || now)
                .setParameter('end', new Date(Number(queryParams.end)) || now);
        }
        if (queryParams.device) {
            query.andWhere('article.device=:key').setParameter('key', queryParams.device);
        }

        const { page = 1, pageSize = 30 } = queryParams;
        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        let sortSet = 'article.createAt';
        // console.log(queryParams.sortA)
        switch (queryParams.sortA) {
            case 1:
                sortSet = 'article.views';
                break;
            case 2:
                sortSet = 'article.comment';
                break;
            case 3:
                sortSet = 'article.feeling';
                break;
        }
        query.orderBy(sortSet, queryParams.sortB === 1 ? 'ASC' : 'DESC');

        if (!isAdmin) {
            query.select([
                'article.id',
                'article.cover',
                'article.clan',
                'article.ancestor',
                'article.seniority',
                'article.views',
                'article.comment',
                'article.feeling',
                'article.lat',
                'article.lng',
                'article.address',
                'article.createAt',
            ]);
        }
        return query.getManyAndCount();
    }
    /**
     * 获取people所在的所有家谱
     */
    async findCatalog(queryParams): Promise<[Article[], number]> {
        const query = this.articleRepository.createQueryBuilder('article');
        const parr = queryParams.split(',');
        query.where('article.id IN (:id)').setParameter('id', parr);
        query.skip((+0) * +30);
        query.take(+30);
        query.orderBy('article.createAt', 'ASC');
        query.select([
            'article.id',
            'article.ancestor',
            'article.clan',
            'article.address',
            'article.manageId',
        ]);
        return query.getManyAndCount();
    }
    async updatePeople(body) {
        return this.peopleService.updateById(body.id, body);
    }

    /**
     * 获取指定家谱信息
     * @param id
     */
    async findById(id, code, role = 0): Promise<Article> {
        const query = this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.user', 'user')
            .where('article.id=:id').setParameter('id', id)
            .select([
                'article.id',
                'article.status',
                'article.cover',
                'article.clan',
                'article.ancestor',
                'article.ancestorId',
                'article.seniority',
                'article.tree',
                'article.content',
                'article.manageId',
                'article.views',
                'article.comment',
                'article.feeling',
                'article.lat',
                'article.lng',
                'article.address',
                'article.createAt',
                'article.updateAt',
                'user.id',
                'user.cover',
                'user.nickname',
            ]);
        const data = await query.getOne();
        if (!data) {
            throw new HttpException('家谱不存在', HttpStatus.I_AM_A_TEAPOT);
        }
        if (data.status === 1 && role < 5) {
            throw new HttpException('家谱不可见', HttpStatus.I_AM_A_TEAPOT);
        }
        if (role !== 5) {
            if (data.private) {
                if (!code || code !== data.privateCode) {
                    throw new HttpException(!code ? '私密家谱，请输入密码访问' : '密码错误', HttpStatus.NOT_ACCEPTABLE);
                }
            }
        }
        return data;
    }

    /**
     * 更新指定家谱阅读量 + 1
     * @param id
     * @param article
     */
    async updateViewsById(id, type= 0, num= 1): Promise<Article> {
        const oldArticle = await this.articleRepository.findOne(id);

        const par = [
            {views: oldArticle.views + num},
            {comment: oldArticle.comment + num},
            {feeling: oldArticle.feeling + num},
        ];
        const updatedArticle = await this.articleRepository.merge(oldArticle, par[type]);
        return this.articleRepository.save(updatedArticle);
    }

    /**
     * 删除家谱
     * @param id
     */
    async deleteById(id, userId = null, isAdmin = false) {
        // const article = await this.articleRepository.findOne(id);
        const article = await this.findById(id, userId, 5);
        // console.log(article)
        // console.log(83838383)
        if (article && article.user && userId === article.user.id || isAdmin) {
            return this.articleRepository.remove(article);
        } else {
            throw new HttpException('你没有该家谱的修改权限', HttpStatus.I_AM_A_TEAPOT);
        }
    }

    /**
     * 关键词搜索家谱---以下是没用的
     * @param keyword
     */
    async search(keyword) {
        const res = await this.articleRepository
            .createQueryBuilder('article')
            .where('article.title LIKE :keyword')
            .orWhere('article.ancestor LIKE :keyword')
            // .orWhere('article.content LIKE :keyword')
            .setParameter('keyword', `%${keyword}%`)
            .getMany();

        return res;
    }

    /**
     * 推荐家谱
     * @param articleId
     */
    async recommend(articleId = null) {
        const query = this.articleRepository
            .createQueryBuilder('article')
            .orderBy('article.updateAt', 'DESC')

        if (!articleId) {
            query.where('article.status=:status').setParameter('status', 'publish');
            return query.take(6).getMany();
        } else {
            const sub = this.articleRepository
                .createQueryBuilder('article')
                .orderBy('article.updateAt', 'DESC')
                .where('article.id=:id')
                .setParameter('id', articleId);
            const exist = await sub.getOne();

            if (!exist) {
                return query.take(6).getMany();
            }

            const { ancestor } = exist;

            try {
                const nodejieba = require('nodejieba');
                const topN = 4;
                const kw1 = nodejieba.extract(name, topN);
                const kw2 = nodejieba.extract(ancestor, topN);

                kw1.forEach((kw, i) => {
                    let paramKey = `title_` + i;
                    if (i === 0) {
                        query.where(`article.title LIKE :${paramKey}`);
                    } else {
                        query.orWhere(`article.title LIKE :${paramKey}`);
                    }
                    query.setParameter(paramKey, `%${kw.word}%`);
                });

                kw2.forEach((kw, i) => {
                    let paramKey = `ancestor_` + i;
                    if (!kw1.length) {
                        query.where(`article.ancestor LIKE :${paramKey}`);
                    } else {
                        query.orWhere(`article.ancestor LIKE :${paramKey}`);
                    }
                    query.setParameter(paramKey, `%${kw.word}%`);
                });
            } catch (e) {}

            const data = await query.getMany();
            return data.filter((d) => d.id !== articleId && d.status < 1);
        }
    }
}
