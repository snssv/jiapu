import { Injectable } from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Account} from './account.entity';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) {}
    async findByUserName(username): Promise<Account> {
        return this.accountRepository.findOne({where: {username}});
    }
}
