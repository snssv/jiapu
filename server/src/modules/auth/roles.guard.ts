import {
    CanActivate,
    ExecutionContext, HttpException, HttpStatus,
    Injectable,
    SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

const CryptoJS = require('crypto-js');

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

const JieMi = vx => {
    const decrypt = CryptoJS.AES.decrypt(vx, CryptoJS.enc.Utf8.parse('0421AC1F30CC4D45'), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return decrypt.toString(CryptoJS.enc.Utf8);
};
// 敏感词过滤
import filterWord from '../../filters/filterWord';
// const filterWord = ['嬲', '肏'];
import Mint from 'mint-filter';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<string[]>('roles', context.getHandler());

        if (!roles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();

        let token = request.headers.authorization;
        let sm = request.headers.token;
        let user = null;
        let hasRole = false;

        // console.log(sm.split('@Mira&')[0]);

        let svx = null;
        if (sm && sm.indexOf('ej!W&') > 0) {
            sm = sm.split('ej!W&')[0];
            // console.log(sm);
            svx  =  sm ? JieMi(sm) : null;
        }

        // console.log(svx);
        const now = Date.now();
        if (!sm || !svx || now - svx.a > 60 || now - svx.a < -60) {
            // 客户端token无效或者超过60s时，发送系统时间给客户端进行校正
            throw new HttpException('' + now, HttpStatus.LENGTH_REQUIRED);
        }

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();

            user = this.jwtService.decode(token) as any;
            hasRole = roles.some(role => role === user.role + '');
        }
        const mint = new Mint(JSON.parse(decodeURI(filterWord.word)));
        let xxb = true;
        // console.log(request.url)
        // console.log(roles)
        // console.log(hasRole)
        if (request.body && request.url !== '/api/user/upload' && (request.body.name || request.body.ancestor || request.body.an || request.body.seniority || request.body.nickname || request.body.content)) {
            const ws = mint.filterSync(JSON.stringify(request.body).toLowerCase().replace(/\s+/g, ""));
            if (ws) {
                xxb = ws.pass;
            }
        }
        if (!xxb) {
            // console.log(xxb);
            throw new HttpException('小站生存不易，请勿发布非法内容，感恩', HttpStatus.FAILED_DEPENDENCY);
        } else {
            return (user && user.role && hasRole) || roles.length < 1;
        }

    }
}
