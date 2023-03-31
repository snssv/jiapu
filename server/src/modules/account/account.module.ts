import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';
import { Account } from './account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account]),
  ],
  exports: [AccountService],
  providers: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
