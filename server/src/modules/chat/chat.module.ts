import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { User } from '../user/user.entity';
import { Group, GroupMap } from '../group/group.entity';
import { GroupMessage } from '../group/groupMessage.entity';
import { FriendMap } from '../friend/friend.entity';
import { FriendMessage } from '../friend/friendMessage.entity';
import {GroupService} from "../group/group.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Group, GroupMap, GroupMessage, FriendMap, FriendMessage])
    ],
    providers: [ChatGateway,GroupService],
    controllers: [ChatController],
})
export class ChatModule {}
