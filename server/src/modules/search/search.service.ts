import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from '../article/article.service';
import { Search } from './search.entity';
import dayjs = require('dayjs');

@Injectable()
export class SearchService {
    constructor(
        @InjectRepository(Search)
        private readonly searchRepository: Repository<Search>,
        private readonly articleService: ArticleService,
    ) {}

    /**
     * 搜素家谱
     * @param type
     */
    async searchArticle(type, keyword) {
        // const articles = await this.articleService.search(keyword);
        if (keyword.length < 10) {
            await this.addRecord(type, keyword);
        }
        return;
        // return articles;
    }

    async addRecord(type, keyword) {
        const exist = await this.searchRepository.findOne({
            where: { type, keyword },
        });

        if (exist) {
            const count = exist.count;
            const newData = await this.searchRepository.merge(exist, {
                count: count + 1,
            });
            await this.searchRepository.save(newData);
            return newData;
        }

        const newData2 = await this.searchRepository.create({ type, keyword });
        await this.searchRepository.save(newData2);
    }

    /**
     * 获取所有搜索记录
     */
    async findAll(queryParams: any = {}, isAdmin= false): Promise<[Search[], number]> {
        const query = this.searchRepository
            .createQueryBuilder('search')
            .where('search.updateAt >= :week').setParameter('week', dayjs().subtract(30, 'day').toDate())
            .orderBy('search.count', 'DESC');

        const { page = 1, pageSize = isAdmin ? 30 : 10, pass, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);
        if (!isAdmin) {
            query.andWhere('search.locked = :key').setParameter('key', false)
        }
        // if (otherParams) {
        //     Object.keys(otherParams).forEach(key => {
        //         query
        //             .andWhere(`search.${key} LIKE :${key}`)
        //             .setParameter(`${key}`, `%${otherParams[key]}%`);
        //     });
        // }

        return query.getManyAndCount();
    }

    /**
     * 删除搜索记录
     * @param id
     */
    async deleteById(id) {
        const data = await this.searchRepository.findOne(id);
        return this.searchRepository.remove(data);
    }
    async changeLock(id) {
        const data = await this.searchRepository.findOne(id);
        if (!data) {
            throw new HttpException('数据不存在', HttpStatus.I_AM_A_TEAPOT);
        }
        const newData = await this.searchRepository.merge(data, {
            locked: !data.locked,
        });
        await this.searchRepository.save(newData);
        return newData;
    }
}
