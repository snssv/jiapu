import { Module } from '@nestjs/common';
import { FollowsController } from './follows.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthModule} from "../auth/auth.module";
import {UserModule} from "../user/user.module";
import {FollowsService} from "./follows.service";
import {Follows} from "./follows.entity";

@Module({
    imports:[
        TypeOrmModule.forFeature([Follows]),
        AuthModule,
        UserModule
    ],
    providers:[FollowsService],
    controllers: [FollowsController]
})
export class FollowsModule {}
