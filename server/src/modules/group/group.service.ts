import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMap } from './group.entity';
import { GroupMessage } from './groupMessage.entity'
import { RCode } from '../../common/constant/rcode';

@Injectable()
export class GroupService {
    constructor(
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(GroupMap)
        private readonly groupUserRepository: Repository<GroupMap>,
        @InjectRepository(GroupMessage)
        private readonly groupMessageRepository: Repository<GroupMessage>,
    ) {}

    async postGroups() {


    }

    async joinGroups(par) {
        const groupx = await this.findUserGroups({groupId:par.group,role:2})
        // console.log(groupx)
        const vd = await this.groupUserRepository.findOne(par)

        if (vd) {
            throw new HttpException(vd.status==2?'你的申请已经被拒绝':'申请等待处理中', HttpStatus.PRECONDITION_FAILED);
        }
        else if (!(groupx && groupx[0])) {
            throw new HttpException('目标群组不存在', HttpStatus.NOT_FOUND);
        }

        else {
            let xv = groupx[0][0]
            let parx = {
                user: par.user,
                group: xv.group,
                host: xv.user,
                role: par.role||0,
                status: par.status||0
            }
            // console.log(xv)
            const group = await this.groupUserRepository.save(parx)
            return group
        }
    }


    async joinGroupsInv(par,adminId) {
        const oldObj = await this.groupUserRepository.findOne({id:par.id})

        const groupx = await this.findUserGroups({groupId:par.group,userId:adminId})

        const newObj = {
            ...oldObj,
            status: par.status
        };

        const updatedObj = await this.groupUserRepository.merge(
            oldObj,
            newObj
        );
        await this.groupUserRepository.save(updatedObj);

    }

    // async getUserGroups(userId: string) {
    //     try {
    //         let data;
    //         if (userId) {
    //             data = await this.groupUserRepository.findAndCount({userId: userId})
    //             return { msg:'获取用户所有群成功', data}
    //         }
    //         data = await this.groupUserRepository.find()
    //         return { msg:'获取系统所有群成功', data}
    //     } catch (e) {
    //         return {code: RCode.ERROR, msg:'获取用户的群失败',data: e}
    //     }
    // }

    async findById(id) {
        // console.log(id)
        const query = this.groupRepository
            .createQueryBuilder('group')
            .where('group.id=:key').setParameter('key',id)
            .leftJoinAndSelect('group.host','host')

        const xxx = await query.getMany();
        // console.log(xxx);
        return xxx[0]

    }

    async findAll(queryParams: any = {},role=0): Promise<[Group[], number]> {

        const query = this.groupRepository
            .createQueryBuilder('group')
            // .select([
            //     "group.role",
            //     "id",
            //     "userId"
            //     ]
            // )


        // console.log(userId);

        if (queryParams.hostId) {
            query.andWhere('group.hostId=:key').setParameter('key', queryParams.hostId);
        }

        if (queryParams.category<999) {
            query.andWhere('group.category=:key').setParameter('key', parseInt(queryParams.category))
        }

        if (queryParams.start || queryParams.end) {
            const now = new Date().getTime();
            query.andWhere('group.happendAt >= :start and group.happendAt <= :end')
                .setParameter('start', queryParams.start || now)
                .setParameter('end', queryParams.end || now)
        }

        if (queryParams.key) {
            query.andWhere('group.name like :key')
                .orWhere('group.summary like :key')
                .setParameter('key', '%'+queryParams.key+'%')
        } else {
            query.andWhere('group.level<=:key')
                .setParameter('key', role<5?0:5)
        }

        const { page = 1, pageSize = 30, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        let sortSet ='group.updateAt';
        // console.log(queryParams.sortA)

        // console.log(sortSet)

        query.orderBy(sortSet, parseInt(queryParams.sortB)==1?'ASC':'DESC');

        const [data, total] = await query.getManyAndCount();

        return [data, total];

    }


    async findUserGroups(queryParams: any = {}): Promise<[GroupMap[], number]> {
        const {user,host, group, role, status, page = 1, pageSize = 30, ...otherParams } = queryParams;


        const query = this.groupUserRepository
            .createQueryBuilder('groupMap')
            // .where('groupMap.status=1')

        // console.log(8788777);
        // console.log(userId);
        // query.where('groupMap.status=:key').setParameter('key', status?status:1);

        if (status||status==0) {
            query.andWhere('groupMap.status=0')
        } else {
            query.andWhere('groupMap.status=1')
        }

        if (user) {
            query.andWhere('groupMap.user=:key').setParameter('key', user);
        }
        if (host) {
            query.andWhere('groupMap.host=:key').setParameter('key', host);
        }
        if (group) {
            query.andWhere('groupMap.group=:key').setParameter('key', group);
        }
        if (role) {
            query.andWhere('groupMap.role=:key').setParameter('key', role);
        }


        query.leftJoinAndSelect('groupMap.user','user')
        query.leftJoinAndSelect('groupMap.group','group')


        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);



        query.orderBy('groupMap.role', 'DESC');

        const [data, total] = await query.getManyAndCount();

        // console.log(data,total);
        return [data, total];

    }



    async getGroupMessages(groupId: string) {
        try {
            let data;
            if (groupId) {
                data = await this.groupMessageRepository.find({groupId: groupId})
                return { msg: '获取群消息成功', data}
            }
            return { msg: '获取所有群消息成功', data: await this.groupMessageRepository.find()}
        } catch (e) {
            return {code: RCode.ERROR, msg:'获取群消息失败', data: e}
        }
    }

    async getGroupsByName(name: string) {
        try {
            if (name) {
                const groups = await this.groupRepository.find({name: Like(`%${name}%`)})
                return { data: groups}
            }
            return {code: RCode.FAIL, msg:'请输入群昵称', data: null}
        } catch(e) {
            return {code: RCode.ERROR, msg:'查找群错误', data: null}
        }
    }
}
