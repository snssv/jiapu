import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';
import { People } from './people.entity';
import {MessageModule} from '../message/message.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([People]),
        UserModule,
        AuthModule,
        MessageModule,
    ],
    exports: [PeopleService],
    providers: [PeopleService],
    controllers: [PeopleController],
})
export class PeopleModule {}
