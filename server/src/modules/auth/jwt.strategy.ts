import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '../user/user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'mira',
        });
    }

    async validate(payload: User) {
        const user = await this.authService.validateUser(payload);
        //console.log(user)
        if (!user) {
            throw new UnauthorizedException('身份验证失败');
        }
        return user;
    }
}
