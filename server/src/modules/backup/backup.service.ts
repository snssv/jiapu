import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleService } from '../article/article.service';
import { UserService } from '../user/user.service';
import { Backup } from './backup.entity';

@Injectable()
export class BackupService {
    constructor(
        @InjectRepository(Backup)
        private readonly backupRepository: Repository<Backup>,
        private readonly articleService: ArticleService,
        private readonly userService: UserService,
    ) {}

    async create(id: Partial<Backup>, existUser = null): Promise<Backup> {
        const article = await this.articleService.findById(id, 0, 5);
        if (!article) {
            throw new HttpException('家谱不存在', HttpStatus.BAD_REQUEST);
        }
        const fd = await this.findAll(id);
        if (fd && fd[0] && fd[0][0] && fd[0][0].createAt) {
            // console.log(fd[0][0].createAt)
            const Tm = Date.now() - new Date(fd[0][0].createAt).getTime() || 0;
            if (Tm < 300000) {
                throw new HttpException((Tm > 60000 ? Number(Tm/60000).toFixed(0) + '分钟' : Number(Tm/1000).toFixed(0) + '秒') + '前备份过了', HttpStatus.I_AM_A_TEAPOT);
            }

        }
        const newBackup = await this.backupRepository.create({
            content: JSON.stringify({
                id: article.id,
                content: article.content,
                tree: article.tree,
            }),
            hostId: article.id,
            hostName: article.ancestor,
        });
        await this.backupRepository.save(newBackup);
        return newBackup;
    }

    async findAll(id): Promise<[Backup[], number]> {
        const query = this.backupRepository
            .createQueryBuilder('backup')
            .where('backup.hostId LIKE :id').setParameter('id', id)
            .orderBy('backup.createAt', 'DESC');

        query.skip((+1 - 1) * +20);
        query.take(+20);

        return query.getManyAndCount();
    }

    async deleteById(id) {
        const data = await this.backupRepository.findOne(id);
        return this.backupRepository.remove(data);
    }
}
