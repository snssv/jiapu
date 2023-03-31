import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {AuthModule} from "../auth/auth.module";
import {UserModule} from "../user/user.module";
import {MessageService} from "./message.service";
import {Message} from "./message.entity";

@Module({
    imports:[
        TypeOrmModule.forFeature([Message]),
        AuthModule,
        UserModule
    ],
    exports:[MessageService],
    providers:[MessageService],
    controllers: [MessageController]
})
export class MessageModule {}
