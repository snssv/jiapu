import { JwtService } from '@nestjs/jwt';
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) {}

    createToken(user: Partial<User>) {
        const accessToken = this.jwtService.sign(user);
        return accessToken;
    }

    async signin(user: Partial<User>,isAdmin=false) {
        const data = await this.userService.signin(user);
        if (isAdmin&&data.role<5) {
            throw new HttpException('你没有管理权限', HttpStatus.I_AM_A_TEAPOT);
        }
        const token = this.createToken({
            id: data.id,
            role: data.role,
            username: data.username
            // email: data.email,
        });
        return Object.assign(data, { token });
    }
    async signup(req,user: Partial<User>) {
        const data = await this.userService.createUser(req,user);

        const token = this.createToken({
            id: data.id,
            role: data.role,
            username: data.username
            // email: data.email,
        });
        return Object.assign(data, { token });
    }
    async checkUser(req) {
        return 1
    }
    async validateUser(payload: User): Promise<any> {
        return await this.userService.findById(payload.id);
    }
}
