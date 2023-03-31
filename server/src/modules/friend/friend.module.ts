import { Module } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendMap } from './friend.entity'
import { FriendMessage } from './friendMessage.entity'

@Module({
    imports: [
        TypeOrmModule.forFeature([FriendMap, FriendMessage]),
    ],
    controllers: [FriendController],
    providers: [FriendService]
})
export class FriendModule {}
