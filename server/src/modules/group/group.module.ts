import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupService } from './group.service'
import { GroupController } from './group.controller'
import { Group, GroupMap } from './group.entity'
import { GroupMessage } from './groupMessage.entity'
import {AuthModule} from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Group, GroupMap, GroupMessage]),
        AuthModule
    ],
    providers: [GroupService],
    controllers: [GroupController],
})
export class GroupModule {}
