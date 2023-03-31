import {Injectable, HttpException, HttpStatus, ExecutionContext} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { config } from '../../config';
import { User } from './user.entity';
import * as fs from 'fs-extra';
import { join } from 'path';
import {JwtService} from '@nestjs/jwt';
import * as dayjs from 'dayjs';

const mkdirp = require('mkdirp');
const getDirName = require('path').dirname

const CryptoJS = require('crypto-js');
const JieMi = vx => {
    const decrypt = CryptoJS.AES.decrypt(vx, CryptoJS.enc.Utf8.parse('0421AC1F30CC4D45'), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    return JSON.parse(decrypt.toString(CryptoJS.enc.Utf8));
};
export function getClientIP(req) {
    const ip =
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        (req.connection && req.connection.remoteAddress) || // 判断 connection 的远程 IP
        (req.socket && req.socket.remoteAddress) || // 判断后端的 socket 的 IP
        (req.connection &&
            req.connection.socket &&
            req.connection.socket.remoteAddress);

    let sm = req.headers.token;
    let svx = null;
    if (sm && sm.indexOf('ej!W&') > 0) {
        sm = sm.split('ej!W&')[0];
        svx  =  sm ? JieMi(sm) : null;
    }

    return ({ip: ip.split(':').pop(), device: svx});
}
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {
        const { username, password } = config.admin;
        this.createUser('adminMira', {username, password, role: 9})
            .then(_ => {
                // console.log();
                console.log(
                    `管理员账户创建成功，用户名：${username}，密码：$|{password}，请及时登录系统修改默认密码`
                );
            })
            .catch( err => {
                // console.log(err);
                console.log(
                    `管理员账户已经存在，用户名：${username}，密码：$|{password}，请及时登录系统修改默认密码`
                );
            });
    }

    async checkUser(req , t = null) {
        let token = req.headers.authorization;

        if (!token && t) {
            throw new HttpException('登录超时', HttpStatus.UNAUTHORIZED);
        }

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;

        if (tokenUser) {
            const id = tokenUser.id;
            const exist = await this.findById(id);
            return exist;
        } else {
            if (t) {
                throw new HttpException('登录超时', HttpStatus.UNAUTHORIZED);
            } else {
                const x = getClientIP(req).device.b;
                return {id: 'visitors' + x, nickname: '游客' + x, role: 0};
            }
        }

    }

    async findAll(queryParams: any = {}, isAdmin= false): Promise<[User[], number]> {
        const query = this.userRepository
            .createQueryBuilder('user')

        const { page = 1, pageSize = 30, status, author, ...otherParams } = queryParams;

        query.skip((+page - 1) * +pageSize);
        query.take(+pageSize);

        let sortSet = 'user.hot';
        // console.log(queryParams.sortA)
        switch (Number(queryParams.sortA)) {
            case 1:
                sortSet = 'user.followers';
                break;
            case 2:
                sortSet = 'user.updateAt';
                break;
            case 3:
                sortSet = 'user.createAt';
                break;
        }
        // console.log(sortSet)

        query.orderBy(sortSet, Number(queryParams.sortB) === 1 ? 'ASC' : 'DESC');

        if (status) {
            query.andWhere('user.status=:key').setParameter('key', status);
        }

        if (author) {
            query.andWhere('user.author=:key').setParameter('key', author);
        }

        // if (otherParams) {
        //     Object.keys(otherParams).forEach(key => {
        //         query
        //             .andWhere(`user.${key} LIKE :${key}`)
        //             .setParameter(`${key}`, `%${otherParams[key]}%`);
        //     });
        // }

        return query.getManyAndCount();
    }

    /**
     * 创建用户
     * @param user
     */
    async createUser(req, user: Partial<User>): Promise<User> {
        const { username } = user;
        if (!username || !/^(?![0-9]+$)[0-9A-Za-z]{4,12}$/.test(username)) {
            throw new HttpException('用户名非法', HttpStatus.BAD_REQUEST);
        }

        const existUser = await this.userRepository.findOne({ where: { username } });
        // console.log(existUser)
        if (existUser || user.id) {
            throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
        }
        const xus = await this.findLast();
        let xx = '269H0G'; /* 分享码(36进制顺序+1) */
        if (xus && xus[0] && xus[0][0] && xus[0][0].code) {
            xx = xus[0][0].code;
        }
        // console.log(req)
        const sb = req && req !== 'adminMira' ? await getClientIP(req) : null;

        // 这里要把用户device 用redis存起来，每个设备一天最多注册一个账号
        // 同时数据库排查ip&device相同的数据进行相应拦截
        // console.log(sb);
        if (sb) {
            user.ip = sb.ip;
            user.device = sb.device.d;
            user.domain = sb.device.b;
        }

        user.code = (parseInt(xx, 36) + 1).toString(36).toUpperCase();
        user.coin = 10;
        user.integral = 10;
        user.role = 0; // 防止创建管理权限账户
        if (req === 'adminMira') {
            user.role = 9;
            user.nickname = '站长';
        }
        const newUser = await this.userRepository.create(user);

        if (user.parent) {
            const xnu = await this.userRepository.findOne({ where: { code: user.parent } });
            if (xnu) {
                xnu.coin += 10;
                xnu.integral += 10;
                this.updateById(xnu.id, xnu);
            }
        }
        this.userRepository.save(newUser);
        delete newUser.ip;
        delete newUser.domain;
        delete newUser.device;
        delete newUser.lat;
        delete newUser.lng;
        delete newUser.address;
        delete newUser.pwdQ;
        delete newUser.pwdA;
        // console.log(newUser);
        return newUser;
    }
    async findLast(): Promise<[User[], number]> {
        const query = this.userRepository.createQueryBuilder('user');
        query.skip((+0) * +1);
        query.take(+1);
        query.orderBy('user.createAt',  'DESC');
        return await query.getManyAndCount();
    }
    /**
     * 用户登录
     * @param user
     */
    async signin(user: Partial<User>): Promise<User> {
        const { username, password } = user;
        const existUser = await this.userRepository.findOne({ where: { username } });

        if (
            !existUser ||
            !(await User.comparePassword(password, existUser.password))
        ) {
            throw new HttpException(
                '用户名或密码错误',
                // tslint:disable-next-line: trailing-comma
                HttpStatus.BAD_REQUEST
            );
        }

        if (existUser.status === 1) {
            throw new HttpException(
                '用户已锁定，无法登录',
                // tslint:disable-next-line: trailing-comma
                HttpStatus.BAD_REQUEST
            );
        }
        delete existUser.ip;
        delete existUser.domain;
        delete existUser.device;
        delete existUser.lat;
        delete existUser.lng;
        delete existUser.address;
        delete existUser.pwdQ;
        delete existUser.pwdA;

        return existUser;
    }

    /**
     * 获取指定用户
     * @param id
     */
    async findById(id): Promise<User> {
        return this.userRepository.findOne(id);
    }

    /**
     * 更新指定用户
     * @param id
     */
    async updateById(id, user): Promise<User> {
        const oldUser = await this.userRepository.findOne(id);
        // console.log(oldUser);
        delete user.password;
        const newUser = await this.userRepository.merge(oldUser, user);
        // console.log(newUser);
        const user2 = await this.userRepository.save(newUser);
        delete user2.ip;
        delete user2.domain;
        delete user2.device;
        delete user2.lat;
        delete user2.lng;
        delete user2.address;
        delete user2.pwdQ;
        delete user2.pwdA;
        return user2;
    }

    async updateByIdAvatar(id, files) {
        // console.log(id)
        const {type, file, name} = files;
        if (!name || !type || !file) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        const pt = join(__dirname, '../../../../upload/cdn/' + id + '/img/' + name + '.jpg');
        // console.log(file)
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
        const dataBuffer = new Buffer(base64Data, 'base64');
        await mkdirp(getDirName(pt), (err) => {
            if (!err) {
                fs.writeFileSync(pt, dataBuffer);
            }
        });
        return name;
    }

    /**
     * 更新指定用户密码
     * @param id
     */
    async updatePassword(id, user): Promise<User> {
        const existUser = await this.userRepository.findOne(id);
        const { oldPassword, newPassword } = user;

        if (!existUser || !(await User.comparePassword(oldPassword, existUser.password))) {
            throw new HttpException('旧密码错误', HttpStatus.BAD_REQUEST);
        }

        const hashNewPassword = User.encryptPassword(newPassword);
        const newUser = await this.userRepository.merge(existUser, {
            password: hashNewPassword,
        });
        return this.userRepository.save(newUser);
    }

    async updatePasswordAdmin(id, pass): Promise<User> {
        const existUser = await this.userRepository.findOne(id);
        const hashNewPassword = User.encryptPassword(pass);
        const newUser = await this.userRepository.merge(existUser, {
            password: hashNewPassword,
        });
        const user2 = await this.userRepository.save(newUser);
        delete user2.ip;
        delete user2.domain;
        delete user2.device;
        delete user2.lat;
        delete user2.lng;
        delete user2.address;
        delete user2.pwdQ;
        delete user2.pwdA;
        return user2;
    }
    async getPwd1(par) {
        const existUser = await this.userRepository.findOne(par);
        if (!existUser) {
            throw new HttpException('用户不存在', HttpStatus.I_AM_A_TEAPOT);
        }
        return existUser.pwdQ;
    }
    async getPwd2(par) {
        const existUser = await this.userRepository.findOne(par);
        if (!existUser) {
            throw new HttpException('答案不正确', HttpStatus.I_AM_A_TEAPOT);
        }
        return existUser.pwdA;
    }
    async getPwd3(par): Promise<User> {
        const existUser = await this.userRepository.findOne({
            username: par.username,
            pwdA: par.pwdA,
        });
        if (!existUser) {
            throw new HttpException('非法请求', HttpStatus.I_AM_A_TEAPOT);
        }
        const hashNewPassword = User.encryptPassword(par.password);
        const newUser = await this.userRepository.merge(existUser, {
            password: hashNewPassword,
        });
        const data = await this.userRepository.save(newUser);
        delete data.password;
        delete data.pwdQ;
        delete data.pwdA;
        delete data.domain;
        delete data.ip;
        delete data.device;
        return data;
    }
}
