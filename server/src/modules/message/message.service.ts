import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import { Message } from './message.entity';
import {Repository} from 'typeorm';
import {UserService} from '../user/user.service';

@Injectable()
export class MessageService {
    constructor (
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
        private readonly userService: UserService,
    ) {}

    async create(
        message: Partial<Message>,
        from = 'admin'
    ): Promise<Message> {
        const { toUser, content,  type = 0 } = message;

        if (!toUser) {
            throw new HttpException('消息未送达，目标用户不存在', HttpStatus.BAD_REQUEST);
        }

        // message.userAgent = parseUserAgent(userAgent);

        let fromUser = null;
        if (from !== 'admin') {
            fromUser = await this.userService.findById(from);
        }

        if (!fromUser || fromUser.id !== toUser.id) {
            const newMessage = await this.messageRepository.create({
                ...message,
                fromUser: fromUser,
                // to: toUser
            });

            await this.messageRepository.save(newMessage);

            return newMessage;
        }
    }
    async findAll(queryParams: any = {}, userId): Promise<[Message[], number]> {
        const query = this.messageRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.fromUser','fromUser')
            .leftJoinAndSelect('message.toUser', 'toUser')
            .select([
                'message.id',
                'message.hostId',
                'message.hostName',
                'message.content',
                'message.status',
                'message.createAt',
                'fromUser.id',
                'fromUser.nickname',
                'fromUser.cover',
                'toUser.id',
                'toUser.nickname',
                'toUser.cover',
            ])
            .where('message.toUser LIKE :id').setParameter('id', userId);
        if (queryParams.status === 0) {
            query.andWhere('message.status < 1');
        }
        const { page = 1, pageSize = 30 } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize).orderBy('message.createAt', 'DESC');

        return query.getManyAndCount();
    }
}
