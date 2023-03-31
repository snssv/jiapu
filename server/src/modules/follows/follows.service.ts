import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import { Follows } from './follows.entity';
import {Repository} from "typeorm";
import {UserService} from "../user/user.service";
import {Message} from "../message/message.entity";

@Injectable()
export class FollowsService {
    constructor (
        @InjectRepository(Follows)
        private readonly followsRepository: Repository<Follows>,
        private readonly userService: UserService,
    ) {}

    async create(
        fromId = 'addmin',
        follows: Partial<Follows>
    ): Promise<Follows> {
        const { from, to } = follows;

        if (!from || !to ) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }

        // follows.userAgent = parseUserAgent(userAgent);
        const fromUser = await this.userService.findById(from);
        const toUser = await this.userService.findById(to);
        // console.log(existUser);
        const newFollows = await this.followsRepository.create({
            ...follows,
            from: fromUser,
            to: toUser
        });


        return newFollows;
    }

    async findAll(queryParams: any = {},userId): Promise<[Message[], number]> {
        const query = this.followsRepository
            .createQueryBuilder('message')
            .leftJoinAndSelect('message.from','from')
            .where('message.toId=:id').setParameter('id',userId)
        ;
        if(queryParams.status===0){
            query.andWhere('message.status < 1')
        }
        const { page = 1, pageSize = 30,  } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize).orderBy('message.createAt', 'DESC');

        const [data, total] = await query.getManyAndCount();

        let newData = [];
        data.forEach((d) => {
            if (d.from) {
                delete d.from.device;
                delete d.from.role;
                delete d.from.parent;
                delete d.from.mobile;
                delete d.from.email;
                delete d.from.username;
                delete d.from.password;
            }
            newData.push(d)
        });

        return [newData, total];
    }
}
