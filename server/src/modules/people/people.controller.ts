import {
    Controller,
    Get,
    HttpStatus,
    HttpCode,
    Post,
    Delete,
    Patch,
    Param,
    Query,
    Body,
    UseGuards,
    Request, HttpException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import {getClientIP, UserService} from '../user/user.service';
import { PeopleService } from './people.service';
import {RedisInstance} from '../chat/redis';
import * as dayjs from 'dayjs';

@Controller('people')
@UseGuards(RolesGuard)
export class PeopleController {
    constructor(
        private readonly peopleService: PeopleService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
    ) {}
    getTokenUser(req) {
        let tokenUser = null;
        if (req.headers.authorization) {
            let token = req.headers.authorization.split('@Mira&')[0];
            if (/Bearer/.test(token)) {
                // 不需要 Bearer，否则验证失败
                token = token.split(' ').pop();
            }
            tokenUser = this.jwtService.decode(token) as any;
        }
        return tokenUser;
    }
    /**
     * 创建people
     * @param people
     */
    @Post()
    @Roles()
    // @Roles('admin')
    // @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() people) {
        const sb = getClientIP(req);
        const existUser = await this.userService.checkUser(req);
        const xa = existUser.role < 5;
        const xb = /visitors/.test(existUser.id);
        const xc = await RedisInstance.xMax(sb.device.d, 'people');
        if (xa && (!xb && xc > 500 || xb && xc > 200)) {
            throw new HttpException('你今天发得太多了，歇会吧', HttpStatus.TOO_MANY_REQUESTS);
        }
        Object.assign(people, {
            device: sb && sb.device ? sb.device.d : null,
        });

        if (people.id) {
            try {
                const peopleN = await this.peopleService.findById(people.id, 5);
                if (peopleN && (!xb && existUser.id === peopleN.user.id || peopleN.device === sb.device.d)) {
                    return this.peopleService.updateById(people.id, people);
                } else {
                    throw new HttpException('你没有修改权限', HttpStatus.I_AM_A_TEAPOT);
                }
            } catch (e) {
                throw new HttpException('你没有修改权限', HttpStatus.I_AM_A_TEAPOT);
            }
        } else {
            return this.peopleService.create(people, xb ? null : existUser);
        }
    }
    @Post('link')
    async link(@Body() people) {
        // console.log(people);
        if (!people.id || !people.articleId) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        return this.peopleService.updateByCatalog(people.id, people);
    }
    @Post('admin')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    async updateAdmin(@Body() people) {
        // console.log(people);
        return this.peopleService.updateById(people.id, people);
    }
    /**
     * 获取所有people
     */
    @Get()
    @Roles()
    @HttpCode(HttpStatus.OK)
    // @UseGuards(JwtAuthGuard)
    findAll(@Query() queryParams) {
        return this.peopleService.findAll(queryParams);
    }
    @Get('admin')
    @Roles('5', '9') // 过滤直接接口请求，带参数即放行的用户类型，5-9为admin
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findAllAdmin(@Query() queryParams) {
        const userId = queryParams.userId;
        return this.peopleService.findAll(queryParams, userId, true);
    }
    /**
     * 获取我的所有people
     */
    @Get('my')
    @Roles()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findMyAll(@Request() req, @Query() queryParams) {
        // console.log(req);
        const tokenUser = this.getTokenUser(req);

        return this.peopleService.findAll(queryParams, tokenUser.id, true);
    }

    /**
     * 获取User所有people
     */
    @Get('user/:id')
    @Roles()
    @HttpCode(HttpStatus.OK)
    // @UseGuards(JwtAuthGuard)
    findUserAll(@Request() req, @Query() queryParams) {
        // console.log(req.params.id);
        const userId = req.params.id;
        // console.log(userId);
        // console.log(4444444);
        return this.peopleService.findAll(queryParams, userId);
    }
    // @Get('manage/:id')
    // @Roles()
    // @HttpCode(HttpStatus.OK)
    // checkManage(@Request() req, @Param('id') id) {
    //     const existUser = this.userService.checkUser(req);
    //     const people = this.peopleService.findById(id);
    //     if (!existUser || !people) {
    //         throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
    //     }
    //     return false;
    // }

    /**
     * 获取指定people
     * @param id
     */
    @Get(':id')
    @Roles()
    async findById(@Request() req, @Param('id') id, @Query('status') status) {
        const sb = getClientIP(req);
        const existUser = await this.userService.checkUser(req);
        const xc = await RedisInstance.xMax(sb.device.d, 'v' + id);

        if (xc < 2 && /^(\w{8})-(\w{4})-(\w{4})-(\w{4})-(\w{12})$/.test(id)) {
            this.peopleService.updateViewsById(id, 0, 1);
        }

        try {
            const exist = await this.peopleService.findById(id, 5);
            return this.peopleService.findById(id, (exist.user && existUser.id === exist.user.id) ? 5 : existUser.role);
        } catch (e) {
            return this.peopleService.findById(id);
        }
    }
    @Get('manage/:id')
    @Roles()
    async findByManage(@Request() req, @Param('id') id, @Query('status') status) {
        return this.peopleService.findById(id, 5);
    }
    /**
     * 删除people
     * @param id
     */
    // @Delete(':id')
    @Post('delete/:id')
    @HttpCode(HttpStatus.OK)
    @Roles()
    @UseGuards(JwtAuthGuard)
    async deleteById(@Request() req, @Param('id') id) {
        try {
            const tokenUser = this.getTokenUser(req);
            const userId = tokenUser ? tokenUser.id : null;
            const exist = await this.userService.findById(userId);
            const isAdmin = exist.role >= 5;
            return this.peopleService.deleteById(id, userId, isAdmin);
        } catch (e) {
            return this.peopleService.deleteById(id);
        }
        return this.peopleService.deleteById(id);
    }
}
