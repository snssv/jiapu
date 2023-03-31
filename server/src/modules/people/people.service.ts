import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as dayjs from 'dayjs';
import * as fs from 'fs-extra';
import {dirname as getDirName, join} from 'path';
import { UserService, getClientIP } from '../user/user.service';
import { People } from './people.entity';
import { MessageService } from '../message/message.service';
import { JwtService } from '@nestjs/jwt';
import {RedisInstance} from '../chat/redis';

import mkdirp from 'mkdirp';

@Injectable()
export class PeopleService {
    constructor(
        @InjectRepository(People)
        private readonly peopleRepository: Repository<People>,
        private readonly messageService: MessageService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * 创建people
     * @param people
     */
    async create(people: Partial<People>, existUser = null): Promise<People> {
        const xus = await this.findLast();
        let xx = '269H0H'; /* 分享码(36进制顺序+1) */
        if (xus && xus[0] && xus[0][0] && xus[0][0].code) {
            xx = xus[0][0].code;
        }
        const newPeople = await this.peopleRepository.create({
            ...people,
            code: (parseInt(xx, 36) + 1).toString(36).toUpperCase(),
            user: existUser,
        });
        await this.peopleRepository.save(newPeople);

        if (existUser) {
            // 不是游客，加分
            existUser.integral += 5;
            existUser.coin += 1;
            this.userService.updateById(existUser.id, existUser);
        }
        return newPeople;
    }
    /**
     * 更新指定people
     * @param id
     * @param people
     */
    async updateByCatalog(id, body): Promise<People> {
        const oldPeople = await this.peopleRepository.findOne(id);
        let catalog = oldPeople.catalog;
        if (body.type === 1) {
            // 1- 添加到新的家谱
            catalog = !catalog ? body.articleId : catalog.indexOf(body.articleId) >= 0 ? catalog : catalog + ',' + body.articleId;
        } else if (catalog.indexOf(body.articleId) >= 0) {
            catalog = catalog.replace(body.articleId + ',', '').replace(body.articleId, '');
        }
        const newPeople = {
            catalog: catalog,
            views: oldPeople.views,
        };

        const updatedPeople = await this.peopleRepository.merge(
            oldPeople,
            newPeople,
        );
        return this.peopleRepository.save(updatedPeople);
    }

    async updateById(id, people: Partial<People>): Promise<People> {
        const oldPeople = await this.peopleRepository.findOne(id);
        // 限制可修改项
        const newPeople = {
            name: people.name,
            sex: people.sex,
            clan: people.clan,
            cover: people.cover,
            content: (!people.content || people.content === '暂不可见') ? oldPeople.content : people.content,
            birthAt: people.birthAt,
            deathAt: people.deathAt,
            public: people.public,
            lat: people.lat,
            lng: people.lng,
            address: people.address,
            views: oldPeople.views,
        };
        const updatedPeople = await this.peopleRepository.merge(
            oldPeople,
            newPeople,
        );
        return this.peopleRepository.save(updatedPeople);
    }

    /**
     * 获取所有people
     */
    async findAll(queryParams: any = {}, userId = null, isAdmin= false): Promise<[People[], number]> {
        const query = this.peopleRepository.createQueryBuilder('people');
        // console.log(queryParams);

        if (queryParams.area) {
            const fwR = [5, 100, 500, 1000, 2000, 50000];
            query.where('sqrt( ( ((:lng-lng)*PI()*12656*cos(((:lat+lat)/2)*PI()/180)/180) * ((:lng-lng)*PI()*12656*cos (((:lat+lat)/2)*PI()/180)/180) ) + ( ((:lat-lat)*PI()*12656/180) * ((:lat-lat)*PI()*12656/180) ) )< :area')
                .setParameter('lat', queryParams.lat)
                .setParameter('lng', queryParams.lng)
                .setParameter('area', fwR[queryParams.area]);
        }

        if (queryParams.key) {
            query.andWhere('people.name LIKE :key OR people.content LIKE :key OR people.tag LIKE :key OR people.address LIKE :key')
                .setParameter('key', '%' + queryParams.key + '%')
        }
        if (queryParams.name) {
            query.andWhere('people.name LIKE :name')
                .setParameter('name', '%' + queryParams.name + '%')
        }
        if (userId) {
            query.andWhere('people.userId=:userId').setParameter('userId', userId);
        }
        if (!isAdmin && !(queryParams.name || queryParams.code)) {
            query.andWhere('people.public=1');
        }
        if (queryParams.code) {
            query.andWhere('people.code=:key').setParameter('key', queryParams.code);
        }
        if (queryParams.start || queryParams.end) {
            const now = new Date().getTime();
            query.andWhere('people.createAt >= :start and people.createAt <= :end')
                .setParameter('start', queryParams.start || now)
                .setParameter('end', queryParams.end || now);
        }

        if (queryParams.device) {
            query.andWhere('people.device=:key').setParameter('key', queryParams.device);
        }

        if (queryParams.type) {
            query.andWhere('people.type=:key').setParameter('key', queryParams.type);
        }
        const { page = 1, pageSize = 30, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        let sortSet = 'people.createAt';
        // console.log(queryParams.sortA)
        switch (queryParams.sortA) {
            case 1:
                sortSet = 'people.views';
                break;
            case 2:
                sortSet = 'people.comment';
                break;
            case 3:
                sortSet = 'people.feeling';
                break;
        }

        query.orderBy(sortSet, queryParams.sortB === 1 ? 'ASC' : 'DESC');
        if (!isAdmin) {
            const Arr = [
                'people.id',
                'people.sex',
                'people.name',
                'people.cover',
                'people.clan',
                'people.code',
                'people.views',
                'people.comment',
                'people.feeling',
                'people.lat',
                'people.lng',
                'people.address',
                'people.birthAt',
                'people.deathAt',
                'people.createAt',
            ];
            if (queryParams.name || queryParams.code) {
                Arr.push('people.summary');
            }
            query.select(Arr);
        }
        return query.getManyAndCount();
    }
    async findLast(): Promise<[People[], number]> {
        const query = this.peopleRepository.createQueryBuilder('people');
        query.skip((+0) * +1);
        query.take(+1);
        query.orderBy('people.createAt',  'DESC');
        return await query.getManyAndCount();
    }

    /**
     * 获取指定people信息
     * @param id
     */
    async findById(id, role = 0): Promise<People> {
        // console.log(555,id)
        const query = this.peopleRepository
            .createQueryBuilder('people')
            .leftJoinAndSelect('people.user', 'user');
        if (id.length > 6) {
            query.where('people.id=:id').setParameter('id', id);
        } else {
            query.where('people.code=:id').setParameter('id', id);
        }

        // if (status) {
        //     query.andWhere('people.status=:status').setParameter('status', 0);
        // }
        query.select([
            'people.id',
            'people.sex',
            'people.name',
            'people.cover',
            'people.clan',
            'people.code',
            'people.content',
            'people.public',
            'people.views',
            'people.comment',
            'people.feeling',
            'people.lat',
            'people.lng',
            'people.address',
            'people.catalog',
            'people.birthAt',
            'people.deathAt',
            'people.createAt',
            'people.updateAt',
            'user.id',
            'user.cover',
            'user.nickname',
        ]);
        const data = await query.getOne();
        if (!data) {
            throw new HttpException('人物信息不存在', HttpStatus.I_AM_A_TEAPOT);
        }
        if (role < 5 && !data.public && new Date().getFullYear() - new Date( Number(data.birthAt || 0)).getFullYear() < 100) {
            data.cover = null;
            if (data.content) {
                data.content = '暂不可见';
            }
        }
        return data;
    }
    /**
     * 更新指定people阅读量 + 1
     * @param id
     * @param people
     */
    async updateViewsById(id, type= 0, num= 1): Promise<People> {
        const oldPeople = await this.peopleRepository.findOne(id);
        if (!oldPeople) {
            throw new HttpException('人物信息不存在', HttpStatus.I_AM_A_TEAPOT);
        }
        const par = [
            {views: oldPeople.views + num},
            {comment: oldPeople.comment + num},
            {feeling: oldPeople.feeling + num}
        ]
        const updatedPeople = await this.peopleRepository.merge(oldPeople, par[type]);
        return this.peopleRepository.save(updatedPeople);
    }

    /**
     * 删除people
     * @param id
     */
    async deleteById(id, userId = null, isAdmin = false) {
        // const people = await this.peopleRepository.findOne(id);
        const people = await this.findById(id, userId);
        // console.log(people)
        // console.log(83838383)
        if (people && people.user && userId === people.user.id || isAdmin) {
            return this.peopleRepository.remove(people);
        } else {
            throw new HttpException('你没有该people的修改权限', HttpStatus.I_AM_A_TEAPOT);
        }
    }

    /**
     * 关键词搜索people
     * @param keyword
     */
    async search(keyword) {
        const res = await this.peopleRepository
            .createQueryBuilder('people')
            .where('people.title LIKE :keyword')
            .orWhere('people.content LIKE :keyword')
            .setParameter('keyword', `%${keyword}%`)
            .getMany();

        return res;
    }
}
