import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMTPService } from '../smtp/smtp.service';
import { ArticleService } from '../article/article.service';
import { SettingService } from '../setting/setting.service';
import { UserService } from '../user/user.service';
import { Comment } from './comment.entity';
import {MessageService} from '../message/message.service';

import UAParser from 'ua-parser-js';
import {PeopleService} from '../people/people.service';

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

    return ({ip: ip.split(':').pop(), device : svx});
}
@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private readonly commentRepository: Repository<Comment>,
        private readonly articleService: ArticleService,
        private readonly peopleService: PeopleService,
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly smtpService: SMTPService,
        private readonly settingService: SettingService,
    ) {}

    /**
     * 创建评论
     * @param comment
     */
    async create(req, userId = 'visitors1984', comment: Partial<Comment> & { reply?: string; createByAdmin?: boolean }): Promise<Comment> {
        const { hostId, nickname, content, type, createByAdmin = false } = comment;

        if (!hostId || !nickname || !content || !type && type !== 0) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        const sb = getClientIP(req);

        comment.pass = true;
        // comment.userAgent = parseUserAgent(userAgent);
        const existUser = await this.userService.findById(userId);
        // console.log(existUser);
        const newComment = await this.commentRepository.create({
            ...comment,
            ip: sb ? sb.ip : null,
            device: sb && sb.device ? sb.device.d : null,
            user: existUser,
        });
        await this.commentRepository.save(newComment);
        let article = null;

        if (comment.type === 0) {
            this.articleService.updateViewsById(comment.hostId, 1, 1);
            article = await this.articleService.findById(hostId, null, 5);
        }
        if (comment.type === 1) {
            this.peopleService.updateViewsById(comment.hostId, 1, 1);
            article = await this.peopleService.findById(hostId);
        }

        if (article && article.user) {
            const articleUs = await this.userService.findById(article.user.id);
            this.messageService.create({
                toUser: articleUs,
                type: comment.type,
                content: content.substr(0, 30),
                hostId: hostId,
                hostName: article.ancestor,
            }, existUser.id);
        }

        return newComment;
    }

    /**
     * 查询所有评论
     * 额外添加家谱信息
     */
    async findAll(queryParams: any = {}, isAdmin= false): Promise<[Comment[], number]> {
        const query = this.commentRepository
            .createQueryBuilder('comment')
            .orderBy('comment.createAt', 'DESC');

        const { page = 1, pageSize = 30, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        if (!isAdmin) {
            query.andWhere('comment.status=0');
        }
        if (otherParams) {
            Object.keys(otherParams).forEach((key) => {
                query
                    .andWhere(`comment.${key} LIKE :${key}`)
                    .setParameter(`${key}`, `%${otherParams[key]}%`);
            });
        }
        if (!queryParams.user) {
            query.leftJoinAndSelect('comment.user', 'user')
        }

        return query.getManyAndCount();
    }

    /**
     * 获取指定评论
     * @param id
     */
    async findById(id): Promise<Comment> {
        return this.commentRepository.findOne(id);
    }
    /**
     * 获取家谱评论
     * @param articleId
     */
    async getArticleComments(hostId, queryParams) {

        const query = this.commentRepository
            .createQueryBuilder('comment')
            .where('comment.hostId=:hostId')
            .andWhere('comment.pass=:pass')
            .andWhere('comment.parentId is NULL')
            .orderBy('comment.createAt', 'DESC')
            .setParameter('hostId', hostId)
            .setParameter('pass', true);
        query.leftJoinAndSelect('comment.user', 'user');
        query.select([
            'comment.id',
            'comment.pass',
            'comment.status',
            'comment.hostId',
            'comment.type',
            'comment.content',
            'comment.feeling',
            'comment.createAt',
            'user.id',
            'user.cover',
            'user.nickname',
        ]);
        const { page = 1, pageSize = 30 } = queryParams;
        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);
        return query.getManyAndCount();
    }

    /**
     * 更新指定家谱阅读量 + 1
     * @param id
     * @param article
     */
    async updateViewsById(id,num=1) {
        const oldArticle = await this.commentRepository.findOne(id);

        const updatedArticle = await this.commentRepository.merge(oldArticle, {
            feeling: oldArticle.feeling + num
        });

        this.commentRepository.save(updatedArticle);
    }


    /**
     * 更新评论
     * @param id
     * @param tag
     */
    async updateById(id, data: Partial<Comment>): Promise<Comment> {
        const old = await this.commentRepository.findOne(id);
        const newData = await this.commentRepository.merge(old, data);

        if (newData.pass) {
            const { hostId, type } = newData;
            // const isReply = replyUserName && replyUserEmail;
            //
            // if (isReply) {
            //     // 发送通知邮件
            //     try {
            //         const {
            //             smtpFromUser: from,
            //             systemUrl,
            //             systemTitle,
            //         } = await this.settingService.findAll(true);
            //         const emailMessage = {
            //             from,
            //             to: replyUserEmail,
            //             subject: '评论回复通知',
            //             html: ``,
            //         };
            //         this.smtpService.create(emailMessage).catch(() => {
            //             console.log(
            //                 `通知用户 ${replyUserName}（${replyUserEmail}），但发送邮件通知失败`
            //             );
            //         });
            //     } catch (e) {}
            // }
        }

        return this.commentRepository.save(newData);
    }

    async deleteById(id) {
        const data = await this.commentRepository.findOne(id);
        return this.commentRepository.remove(data);
    }
}
