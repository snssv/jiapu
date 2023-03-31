import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../user/user.entity';
import { Group, GroupMap } from '../group/group.entity';
import { GroupMessage } from '../group/groupMessage.entity';
import { FriendMap } from '../friend/friend.entity';
import { FriendMessage } from '../friend/friendMessage.entity';
import * as dayjs from 'dayjs';
// import { createWriteStream } from 'fs';
import * as fs from 'fs-extra';
import { join } from 'path';
import { RCode } from '../../common/constant/rcode';
import { RedisInstance } from './redis'
import {GroupService} from "../group/group.service";

const mkdirp = require('mkdirp')
const getDirName = require('path').dirname
// const Img = require('images')



const CryptoJS = require('crypto-js');
const JieMi = vx => {
    let decrypt = CryptoJS.AES.decrypt(vx, CryptoJS.enc.Utf8.parse("0421AC1F30CC4D45"), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return JSON.parse(decrypt.toString(CryptoJS.enc.Utf8))
}

@WebSocketGateway()
export class ChatGateway {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Group)
        private readonly groupRepository: Repository<Group>,
        @InjectRepository(GroupMap)
        private readonly groupUserRepository: Repository<GroupMap>,
        @InjectRepository(GroupMessage)
        private readonly groupMessageRepository: Repository<GroupMessage>,
        @InjectRepository(FriendMap)
        private readonly friendRepository: Repository<FriendMap>,
        @InjectRepository(FriendMessage)
        private readonly friendMessageRepository: Repository<FriendMessage>,
        private readonly groupService: GroupService
    ) {}

    @WebSocketServer()
    server: Server


    async setOnlineUser(user, room=null) {
        const redis = await RedisInstance.initRedis('chat', 1);
        const name = 'olux'+new Date().getDate()
        let cx = await this.getOnlineUser() || {}

        if (!room) {
            // 离开抹除
            // if (cv.indexOf(user)>=0) {
            //     cv.splice(cv.indexOf(user),1)
            // }
            let vx = JSON.stringify(cx).replace(new RegExp(JSON.stringify(user),'g'),'')
                .replace(/,,/g,',')
                .replace(/\[,/g,'[')
                .replace(/,\]/g,']')
            // console.log('离开抹除', vx)
            cx = JSON.parse(vx)
        } else {
            // console.log('加入前'+room, JSON.stringify(cx))
            let cv = cx[room] || []
            if (JSON.stringify(cv).indexOf(JSON.stringify(user))<0) {
                // console.log('没有？')
                cv.push(user)
            }
            cx[room] = cv
            // console.log('加入'+room, JSON.stringify(cx))
        }
        await redis.setex(name, 600000, JSON.stringify(cx))
        return cx
    }
    async getOnlineUser(room=null) {
        const redis = await RedisInstance.initRedis('chat', 1);
        const name = 'olux'+new Date().getDate()
        let cx = await redis.get(name);
        if (cx) { cx = JSON.parse(cx)}
        if (room) {cx = cx[room] }
        return cx
    }

    // socket连接钩子
    async handleConnection(client: Socket): Promise<string> {
        const u = JieMi(client.handshake.query.uid)
        // console.log('连接监听', JSON.stringify(u))

        // const defaultGroup = await this.groupRepository.find({name: 'rootRoom'})
        // if (!defaultGroup.length) {
        //     this.groupRepository.save({
        //         // id: 'rootRoom',
        //         name: 'rootRoom',
        //         userId: 'admin'
        //     })
        // }
        // // 连接默认加入"rootRoom"房间
        // client.join('rootRoom')

        // 用户独有消息房间 根据userId
        if (u.a.id) {
            client.join(u.a.id)
        }


        return '连接成功'
    }
    // socket离开
    async handleDisconnect(client: Socket): Promise<string> {
        const u = JieMi(client.handshake.query.uid)
        // console.log('离开监听', JSON.stringify(u))
        // 离开监听 {"uid":"visitors7EFLXJ7","uname":"游客7EFLXJ7","EIO":"3","transport":"polling","t":"NSOjpTw"}

        this.setOnlineUser({id: u.a.id, nickname: u.a.mane})

        return ''
    }

    async setHistory(data) {

        // console.log(data);

        const rid = data.room.id

        const redis = await RedisInstance.initRedis('chat', 1);

        let msgHis = await redis.get(rid);
        msgHis = msgHis?JSON.parse(msgHis):[]
        if (msgHis.length>=50) {
            msgHis.shift()
        }
        delete data.room
        msgHis.push(data)

        msgHis = JSON.stringify(msgHis)
        // console.log(msgHis)
        await redis.setex(rid, 86400000, msgHis);

    }



    // 创建群组
    @SubscribeMessage('addGroup')
    async addGroup(@ConnectedSocket() client: Socket, @MessageBody() par) {
        // console.log(par)
        try {
            // console.log(4444)
            const isUser = await this.userRepository.findOne({id: par.userId})
            if (isUser) {
                // console.log(isUser)
                const isHaveGroup = await this.groupService.findAll({hostId:par.userId})
                // console.log(isHaveGroup)
                if (isHaveGroup && isHaveGroup[1]>=5) {
                    this.server.to(par.userId).emit('addGroup', { code: RCode.FAIL, msg: '每人最多建5个群', data: isHaveGroup })
                    return;
                }
                // console.log(isHaveGroup)
                const npar = await this.groupRepository.save({
                    ...par,
                    host: isUser
                });
                client.join(npar.id)
                const group = await this.groupUserRepository.save({
                    group: npar,
                    user: isUser,
                    host: isUser,
                    status:1,
                    role:2
                })
                this.server.to(group.group.id).emit('addGroup', { code: RCode.OK, msg: `成功创建群${par.name}`, data: npar })
            } else{
                this.server.to(par.userId).emit('addGroup', { code: RCode.FAIL, msg: `你没资格创建群` })
            }
        } catch(e) {
            this.server.to(par.userId).emit('addGroup', {code: RCode.ERROR, msg:'创建群失败'})
        }
    }

    // 加入故事/群聊房间
    @SubscribeMessage('joinRoom')
    async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() par) {
        // console.log(client);
        // console.log('joinRoom', JSON.stringify(JieMi(par)))
        const px = JieMi(par)

        // 实例化 redis

        // await redis.setex(`${par.room.id}`, 30000, null);
        // console.log(roomUsers)
        client.join(px.a.room.id);

        const dv = await this.setOnlineUser(px.a.user, px.a.room.id)

        this.server.to(px.a.room.id).emit('getOnlineUsers', {
            code: RCode.OK,
            data: dv
        })


        const res = {room: px.a.room, user: px.a.user}
        this.server.to(px.a.room.id).emit('joinRoom', {
            code: RCode.OK,
            msg: `${px.a.user.nickname}加入${px.a.room.name}`,
            data: res
        });


        const redis = await RedisInstance.initRedis('chat', 1);

        let msgHis = await redis.get(px.a.room.id);

        this.server.to(px.a.user.id).emit('getRoomHis', { code: RCode.OK, data: {room_id:px.a.room.id,msg:msgHis?JSON.parse(msgHis):null} })

    }

    // 加入群组
    @SubscribeMessage('joinGroup')
    async joinGroup(@ConnectedSocket() client: Socket, @MessageBody() par) {
        // console.log(par)
        try {
            const isUser = await this.userRepository.findOne({id: par.userId})
            if (isUser) {

                let userGroup = await this.groupUserRepository.findOne({ group: par.groupId, user: par.userId })

                const group = await this.groupService.findById(par.groupId);
                // console.log(group)

                if (group) {
                    if (!userGroup) {
                        userGroup = await this.groupUserRepository.save({
                            group: group,
                            host: group.host,
                            user: isUser,
                            role:0,
                            status: par.password==group.password?1:0
                        });
                        if (par.password==group.password) {

                            client.join(par.groupId);
                            // const res = { group: group, user: user }

                            this.server.to(par.userId).emit('joinRoom', { code: RCode.OK, msg: '口令正确，直接入群'})
                        } else {
                            this.server.to(par.groupId).emit('joinGroupPass', {
                                code: RCode.OK,
                                msg: `${isUser.username}申请加入群${group.name}`,
                                data: userGroup
                            });
                            this.server.to(par.userId).emit('joinRoom', { code: RCode.OK, msg: '口令错误，等待审核'})
                        }
                    } else {

                        this.server.to(par.userId).emit('joinRoom', { code: RCode.FAIL, msg: userGroup.status==2?'已经被拒绝':'等待审核中'})
                    }
                } else {
                    this.server.to(par.userId).emit('joinRoom', { code: RCode.FAIL, msg: '该群不存在'})
                }
            } else {
                this.server.to(par.userId).emit('joinRoom', { code: RCode.FAIL, msg: '你没资格进群'})
            }
        } catch(e) {
            // console.log(e)
            this.server.to(par.userId).emit('joinRoom', {code: RCode.ERROR, msg:'进群失败', data:e})
        }
    }

    // 加入群组批准
    @SubscribeMessage('joinGroupsInv')
    async joinGroupsInv(@ConnectedSocket() client: Socket, @MessageBody() par) {
        const oldObj = await this.groupUserRepository.findOne({id:par.id})
        const newObj = {
            ...oldObj,
            status: par.status
        };
        const updatedObj = await this.groupUserRepository.merge(
            oldObj,
            newObj
        );
        await this.groupUserRepository.save(updatedObj);
        this.server.to(par.userId).emit('joinGroupPass', {
            code: RCode.OK,
            msg: par.admin+(par.status==2?'拒绝':'批准')+'了你进入'+par.group,
            inv: par.status,
            room:{
                id: par.groupId,
                name: par.group
            }
        })
        this.server.to(par.groupId).emit('joinGroupPass', {
            code: RCode.OK,
            msg: par.admin+(par.status==2?'拒绝':'批准')+'了'+par.user+'进入'+par.group
        })

    }


    // 加入群组批准
    @SubscribeMessage('joinGroupsRoom')
    async joinGroupsRoom(@ConnectedSocket() client: Socket, @MessageBody() par) {
        client.join(par.room.id)
    }





    // 发送群消息
    @SubscribeMessage('articleMessage')
    async sendGroupMessage(@MessageBody() data) {
        let newData = data;
        newData.time = dayjs().format('YYYY-MM-DD HH:mm:ss')
        this.setHistory(data)
        this.server.to(data.room.id).emit('articleMessage', {code: RCode.OK, msg:'', data: data})

    }
    @SubscribeMessage('imgMessage')
    async sendImgMessage(@MessageBody() data) {
        let newData = data;
        newData.time = dayjs().format('YYYY-MM-DD HH:mm:ss')

        // console.log(data.msg.c.size)
        const size = data.msg.c.toString('base64').length;
        // console.log(size)


        if (size>5120000) {
            return false
        }

        let filesSize=0;
        const path = join(__dirname, '../../../../upload/cdn/chat/'+dayjs().format('YYYYMMDD')+'/')


        mkdirp(getDirName(path+'read.txt'), (err,data) => {
            //  创建目录
            if (err) return false;
            fs.writeFileSync(path+'read.txt', 'ok')
        })

        try {
            const files = fs.readdirSync(path);//每天上传文件限制100mb
            if (files&&files.length>0) {

                files.forEach((file) => {
                    let states = fs.statSync(path+'/'+file);
                    // console.log(states.size)
                    filesSize+=states.size
                });
            }
        }catch (e) {
            return

        }



        if (filesSize>10240000) {
            this.server.emit('articleMessage', {code: RCode.ERROR, msg:'今日上传限额已满'})
            return false
        }


        const filename = `${dayjs().format('YYYYMMDDHHmmss')}${Math.round(Math.random() * 47)}.${data.msg.x}`;

        const pt = path + filename
        mkdirp(getDirName(pt), (err,data) => {
            // console.log(err)
            // console.log(data)
            if (err) return false;
            fs.writeFileSync(pt, newData.msg.c)
        })
        const xD = {...newData,msg:{t:data.msg.t,c:filename,n:data.msg.n,s:data.msg.s}}
        this.setHistory(xD)
        this.server.to(data.room.id).emit('articleMessage', {code: RCode.OK, msg:'', data: xD})
        this.server.to(data.user.id).emit('upEnd', {code: RCode.OK, msg:'up end'})
    }

    // // 发送群消息
    // @SubscribeMessage('groupMessage')
    // async sendGroupMessage(@MessageBody() data: GroupMessageDto) {
    //     try {
    //         const isUserInGroup = await this.groupUserRepository.findOne({userId: data.userId, groupId: data.groupId})
    //         if (!isUserInGroup) {
    //             this.server.to(data.userId).emit('groupMessage',{code:RCode.FAIL, msg:'群消息发送错误', data: ''})
    //             return;
    //         }
    //         if (data.groupId) {
    //             if (data.messageType === 'image') {
    //                 const randomName = `${Date.now()}$${data.userId}$${data.width}$${data.height}`
    //                 const writeSream = createWriteStream(join('public/static', randomName))
    //                 writeSream.write(data.content)
    //                 data.content = randomName;
    //             }
    //             this.groupMessageRepository.save(data);
    //             this.server.to(data.groupId).emit('groupMessage', {code: RCode.OK, msg:'', data: data})
    //         }
    //     } catch(e) {
    //         this.server.to(data.userId).emit('groupMessage',{ code: RCode.ERROR, msg:'群消息发送错误', data: e })
    //     }
    // }
    //
    // // 添加好友
    // @SubscribeMessage('addFriend')
    // async addFriend(@ConnectedSocket() client: Socket, @MessageBody() data: FriendMap) {
    //     try {
    //         const isUser = await this.userRepository.findOne({userId: data.userId})
    //         if (isUser) {
    //             if (data.friendId && data.userId) {
    //                 if (data.userId === data.friendId) {
    //                     this.server.to(data.userId).emit('addFriend', { code: RCode.FAIL, msg: '不能添加自己为好友', data: '' })
    //                     return;
    //                 }
    //                 const isHave1 = await this.friendRepository.findOne({ userId: data.userId, friendId: data.friendId })
    //                 const isHave2 = await this.friendRepository.findOne({ userId: data.friendId, friendId: data.userId })
    //                 const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId
    //
    //                 if (isHave1 || isHave2) {
    //                     this.server.to(data.userId).emit('addFriend', { code: RCode.FAIL, msg: '已经有该好友', data: data })
    //                     return;
    //                 }
    //
    //                 const friend = await this.userRepository.findOne({
    //                     select: ['userId', 'username', 'avatar', 'role', 'tag', 'createTime'],
    //                     where: { userId: Like(`%${data.friendId}%`) }
    //                 });
    //                 ;
    //                 const user = await this.userRepository.findOne({
    //                     select: ['userId', 'username', 'avatar', 'role', 'tag', 'createTime'],
    //                     where: { userId: Like(`%${data.userId}%`) }
    //                 });
    //                 if (!friend) {
    //                     this.server.to(data.userId).emit('addFriend', { code: RCode.FAIL, msg: '该好友不存在', data: '' })
    //                     return;
    //                 }
    //
    //                 // 双方都添加好友 并存入数据库
    //                 await this.friendRepository.save(data)
    //                 const friendData = JSON.parse(JSON.stringify(data))
    //                 const friendId = friendData.friendId
    //                 friendData.friendId = friendData.userId
    //                 friendData.userId = friendId
    //                 delete friendData._id
    //                 await this.friendRepository.save(friendData)
    //                 client.join(roomId)
    //                 this.server.to(data.userId).emit('addFriend', { code: RCode.OK, msg: '添加好友成功', data: friend })
    //                 this.server.to(data.friendId).emit('addFriend', { code: RCode.OK, msg: '你正被一个人添加', data: user })
    //             }
    //         } else {
    //             this.server.to(data.userId).emit('addFriend', {code: RCode.FAIL, msg:'你没资格加好友' })
    //         }
    //     } catch(e) {
    //         this.server.to(data.userId).emit('addFriend', {code: RCode.ERROR, msg:'添加好友失败', data: e })
    //     }
    // }
    //
    // // 进入私聊房间
    // @SubscribeMessage('joinFriendSocket')
    // async joinFriend(@ConnectedSocket() client: Socket, @MessageBody() data: FriendMap) {
    //     try {
    //         if (data.friendId && data.userId) {
    //             const relation = await this.friendRepository.findOne({ userId: data.userId, friendId: data.friendId })
    //             const roomId = data.userId > data.friendId ?  data.userId + data.friendId : data.friendId + data.userId
    //             if (relation) {
    //                 client.join(roomId)
    //                 this.server.to(data.userId).emit('joinFriendSocket',{ code:RCode.OK, msg:'进入私聊socket成功', data: relation })
    //             }
    //         }
    //     } catch(e) {
    //         this.server.to(data.userId).emit('joinFriendSocket',{ code:RCode.ERROR, msg:'进入私聊socket失败', data: e })
    //     }
    // }


    // // 发送私聊消息
    // @SubscribeMessage('friendMessage')
    // async friendMessage(@ConnectedSocket() client: Socket, @MessageBody() data: FriendMessageDto) {
    //     try {
    //         const isUser = await this.userRepository.findOne({userId: data.userId})
    //         if (isUser) {
    //             if (data.userId && data.friendId) {
    //                 const roomId = data.userId > data.friendId ? data.userId + data.friendId : data.friendId + data.userId
    //                 if (data.messageType === 'image') {
    //                     const randomName = `${Date.now()}$${roomId}$${data.width}$${data.height}`
    //                     const writeSream = createWriteStream(join('public/static', randomName))
    //                     writeSream.write(data.content)
    //                     data.content = randomName;
    //                 }
    //                 await this.friendMessageRepository.save(data)
    //                 this.server.to(roomId).emit('friendMessage', {code: RCode.OK, msg:'', data})
    //             }
    //         } else {
    //             this.server.to(data.userId).emit('friendMessage', {code: RCode.FAIL, msg:'你没资格发消息', data})
    //         }
    //     } catch(e) {
    //         this.server.to(data.userId).emit('friendMessage', {code: RCode.ERROR, msg:'消息发送失败', data})
    //     }
    // }
    //




    @SubscribeMessage('chatData')
    async getAllData(@ConnectedSocket() client,  @MessageBody() userId) {
        // console.log(client);
        // console.log(userId);
        // console.log('获取聊天数据ee失败')
        try {
            // console.log(4444)
            const isUser = await this.userRepository.findOne({id: userId})
            if (isUser) {
                const groups = await this.groupService.findUserGroups({ user: userId })

                let nArr = []
                groups[0].forEach(it => {
                    nArr.push({
                        id:it.group.id,
                        type:'g',
                        name:it.group.name,
                        summary:it.group.summary,
                        role:it.role
                    });
                    client.join(it.group.id);
                })

                this.server.to(userId).emit('chatData', { code: RCode.OK, msg: '获取个人信息成功', data: {
                        groups:nArr,
                        friends:[[],0]
                    } })
            } else{
                this.server.to(userId).emit('chatData', { code: RCode.FAIL, msg: '用户不存在' })
            }
        } catch(e) {
            this.server.to(userId).emit('chatData', {code: RCode.ERROR, msg:'获取个人信息失败', data:e})
        }

    }
}
