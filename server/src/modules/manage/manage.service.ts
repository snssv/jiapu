import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';
import { Manage } from './manage.entity';
const CryptoJS = require('crypto-js');
const JieMi = vx => {
    const decrypt = CryptoJS.AES.decrypt(vx, CryptoJS.enc.Utf8.parse('0421AC1F30CC4D45'), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
};
function getClientIP(req) {
    const ip =
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        (req.connection && req.connection.remoteAddress) || // 判断 connection 的远程 IP
        (req.socket && req.socket.remoteAddress) || // 判断后端的 socket 的 IP
        (req.connection &&
            req.connection.socket &&
            req.connection.socket.remoteAddress);

    let sm = req.headers.token;
    let svx = null;
    if (sm && sm.indexOf('ej!W&') > 0) {
        sm = sm.split('ej!W&')[0];
        svx  =  sm ? JieMi(sm) : null;
    }
    return ({ip: ip.split(':').pop(), device: svx});
}

@Injectable()
export class ManageService {
    constructor(
        @InjectRepository(Manage)
        private readonly manageRepository: Repository<Manage>,
        private readonly articleService: ArticleService,
        private readonly userService: UserService,
    ) {}

    /**
     * 创建审核
     * @param manage
     */
    async create(manage: Partial<Manage>, existUser = null): Promise<Manage> {
        const article = await this.articleService.findById(manage.hostId, 0, 5);
        if (!article) {
            throw new HttpException('家谱不存在', HttpStatus.BAD_REQUEST);
        }
        const old = await this.manageRepository.findOne({hostId: article.id, fromUser: existUser});
        if (old) {
            throw new HttpException('已经提交过申请，请等待创建者审核', HttpStatus.EXPECTATION_FAILED);
        }
        const newManage = await this.manageRepository.create({
            ...manage,
            toUser: article.user,
            hostName: article.ancestor,
            fromUser: existUser,
        });
        await this.manageRepository.save(newManage);
        return newManage;
    }

    /**
     * 查询所有审核
     * 额外添加文章信息
     */
    async findAll(queryParams: any = {}, isAdmin= false): Promise<[Manage[], number]> {
        const query = this.manageRepository
            .createQueryBuilder('manage')
            .orderBy('manage.createAt', 'DESC');

        const { page = 1, pageSize = 30, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        if (!isAdmin) {
            query.andWhere('manage.status=0');
        }

        if (otherParams) {
            Object.keys(otherParams).forEach((key) => {
                query
                    .andWhere(`manage.${key} LIKE :${key}`)
                    .setParameter(`${key}`, `%${otherParams[key]}%`);
            });
        }
        if (!queryParams.user) {
            query.leftJoinAndSelect('manage.user', 'user');
        }

        return query.getManyAndCount();
    }
    async findMy(uid, queryParams): Promise<[Manage[], number]> {
        const query = this.manageRepository
            .createQueryBuilder('manage')
            .leftJoinAndSelect('manage.fromUser', 'fromUser')
            .leftJoinAndSelect('manage.toUser', 'toUser')
            .select([
                'manage.id',
                'manage.hostId',
                'manage.hostName',
                'manage.content',
                'manage.pass',
                'manage.status',
                'manage.createAt',
                'fromUser.id',
                'fromUser.nickname',
                'fromUser.cover',
                'toUser.id',
                'toUser.nickname',
                'toUser.cover',
            ])
            .where('manage.fromUser LIKE :id OR manage.toUser LIKE :id').setParameter('id', '%' + uid + '%')
            .orderBy('manage.createAt', 'DESC');

        const { page = 1, pageSize = 30 } = queryParams;
        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);
        return query.getManyAndCount();
    }

    /**
     * 获取指定审核
     * @param id
     */
    async checkManage(id, user): Promise<Manage> {
        return this.manageRepository.findOne({hostId: id, fromUser: user});
    }
    async reviewManage(id, pass, user): Promise<Manage> {
        const query = this.manageRepository.createQueryBuilder('manage')
            .leftJoinAndSelect('manage.fromUser', 'fromUser')
            .leftJoinAndSelect('manage.toUser', 'toUser')
            .where('manage.id=:id').setParameter('id', id)
        const item = await query.getOne();
        if (!item) {
            throw new HttpException('任务不存在', HttpStatus.BAD_REQUEST);
        }
        if (pass === 1) {
            const art = await this.articleService.findById(item.hostId, 0, 5);
            if (!art.manageId || art.manageId.indexOf(user) < 0) {
                this.articleService.updateByIdAdmin(item.hostId, {
                    manageId: !art.manageId ? item.fromUser.id : art.manageId + ',' + item.fromUser.id
                });
            }
        }
        const newItem = await this.manageRepository.merge(
            item,
            {
                pass: pass === 1 ? 1 : 2,
            },
        );
        return this.manageRepository.save(newItem)
    }

    /**
     * 获取指定审核
     * @param id
     */
    async findById(id): Promise<Manage> {
        return this.manageRepository.findOne(id);
    }

    /**
     * 获取文章审核
     * @param articleId
     */
    async getArticleManages(hostId, queryParams) {
        const query = this.manageRepository
            .createQueryBuilder('manage')
            .where('manage.hostId=:hostId')
            .andWhere('manage.pass=:pass')
            .orderBy('manage.createAt', 'DESC')
            .setParameter('hostId', hostId)
            .setParameter('pass', true);
        const { page = 1, pageSize = 30 } = queryParams;
        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);
        return query.getManyAndCount()
    }
    /**
     * 更新审核
     * @param id
     * @param tag
     */
    async updateById(id, data: Partial<Manage>): Promise<Manage> {
        const old = await this.manageRepository.findOne(id);
        const newData = await this.manageRepository.merge(old, data);
        return this.manageRepository.save(newData);
    }

    async deleteById(id) {
        const data = await this.manageRepository.findOne(id);
        return this.manageRepository.remove(data);
    }
}
