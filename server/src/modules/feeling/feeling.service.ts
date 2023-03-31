import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';
import { Feeling } from './feeling.entity';
import {CommentService} from '../comment/comment.service';
@Injectable()
export class FeelingService {
    constructor(
        @InjectRepository(Feeling)
        private readonly feelingRepository: Repository<Feeling>,
        private readonly articleService: ArticleService,
        private readonly userService: UserService,
        private readonly commentService: CommentService,
    ) {}

    /**
     * 创建点赞
     * @param feeling
     */
    async create(
        userId,
        feeling: Partial<Feeling>,
    ): Promise<Feeling> {
        const {val, hostId, type} = feeling;
        const existUser = await this.userService.findById(userId);
        const oldFeeling = await this.findByOne(userId, hostId);
        let newFeeling = oldFeeling[0][0];
        if (oldFeeling[1] > 0) {
            // 原来赞过
            if (oldFeeling[0][0].val === val) {
                if (type === 0) {
                    this.articleService.updateViewsById(hostId, 2, -1);
                } else {
                    this.commentService.updateViewsById(hostId, -1);
                }
                return this.feelingRepository.remove(oldFeeling[0][0]);
            } else {
                newFeeling = await this.feelingRepository.merge({
                    ...oldFeeling[0][0],
                    val: val,
                });
            }
        } else {
            if (type === 0) {
                this.articleService.updateViewsById(hostId, 2, 1);

            } else {
                this.commentService.updateViewsById(hostId, 1);
            }
            newFeeling = await this.feelingRepository.create({
                ...feeling,
                user: existUser,
            });
        }

        await this.feelingRepository.save(newFeeling);
        return newFeeling;
    }

    async findByOne(userId, hostId): Promise<[Feeling[], number]> {
        const query = this.feelingRepository
            .createQueryBuilder('feeling')
            .leftJoinAndSelect('feeling.user', 'user')
            .where('feeling.hostId=:host')
            .setParameter('host', hostId)
            .orderBy('feeling.createAt', 'DESC');

        return query.getManyAndCount();
    }

    async findAll(queryParams: any = {}): Promise<[Feeling[], number]> {
        const {val, hostId} = queryParams;
        const query = this.feelingRepository
            .createQueryBuilder('feeling')
            .where('feeling.hostId=:host').setParameter('host', hostId)
            .orderBy('feeling.createAt', 'DESC');

        const { page = 1, pageSize = 30 } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        const ants = await query.getManyAndCount();
        let total = ants[1], totalArr = [];

        for (let i = 0; i < 2; i++) {
            const x = await query.andWhere('feeling.val=:xb').setParameter('xb', i).getManyAndCount();
            totalArr.push(x[1]);
        }
        // return query.getManyAndCount();
        return [totalArr, total];
    }

}
