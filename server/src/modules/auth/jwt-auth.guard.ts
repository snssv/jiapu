import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {

    getRequest(context: ExecutionContext) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        return request;
    }

    handleRequest(err: any, user: any, info: any) {
        // console.log(err)
        // console.log(user)
        // console.log(4444444)
        // console.log(info)
        if (err || !user) {
            throw new UnauthorizedException('身份验证失败');
        }
        return user;
    }
}
