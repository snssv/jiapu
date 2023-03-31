import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { VerificationCode } from './verification-code.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([VerificationCode]),
        forwardRef(() => AuthModule),

    ],
    // providers: [UserService],
    // exports: [UserService],
    // controllers: [UserController],
})
export class VerificationCodeModule {}
