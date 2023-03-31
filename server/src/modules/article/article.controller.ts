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
import { ArticleService } from './article.service';
import {RedisInstance} from '../chat/redis';
import * as dayjs from 'dayjs';

@Controller('article')
@UseGuards(RolesGuard)
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService,
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
     * 创建家谱
     * @param article
     */
    @Post()
    @Roles()
    // @Roles('admin')
    // @UseGuards(JwtAuthGuard)
    async create(@Request() req, @Body() article) {
        const sb = getClientIP(req);
        const existUser = await this.userService.checkUser(req);
        const xa = existUser.role < 5;
        const xb = /visitors/.test(existUser.id);
        const xc = await RedisInstance.xMax(sb.device.d, 'article');
        // console.log(xc)
        if (xb) {
            throw new HttpException('目前不支持游客发布', HttpStatus.I_AM_A_TEAPOT);
        }
        if (xa && (!xb && xc > 500 || xb && xc > 100)) {
            throw new HttpException('你今天发得太多了，歇会吧', HttpStatus.TOO_MANY_REQUESTS);
        }
        Object.assign(article, {
            nickname: existUser.nickname,
            ip: sb ? sb.ip : null,
            domain: sb && sb.device ? sb.device.e : null,
            device: sb && sb.device ? sb.device.d : null,
        });

        if (article.id) {
            try {
                const articleN = await this.articleService.findById(article.id, null, 5);
                // tslint:disable-next-line:max-line-length
                if (!xb && articleN && existUser.id === articleN.user.id || articleN.manageId.indexOf(existUser.id) >= 0 || articleN.device === sb.device.d) {
                    return this.articleService.updateById(article.id, article);
                }
            } catch (e) {
                throw new HttpException('你没有修改权限', HttpStatus.I_AM_A_TEAPOT);
            }

        } else {
            return this.articleService.create(req, article, xb ? null : existUser);
        }

    }
    @Post('admin')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    async updateAdmin(@Body() article) {
        // console.log(article);
        if (!article || !article.id) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        return this.articleService.updateByIdAdmin(article.id, article);
    }
    @Post('people')
    async updatePeople(@Request() req, @Body() par) {
        if (!par || !par.articleId) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        // console.log(par);
        const user = this.getTokenUser(req);
        // console.log(user);
        const ods =  await this.articleService.findById(par.articleId, null, 5);
        // console.log(ods);
        if (user && ods && ods.manageId.indexOf(user.id) >= 0) {
            this.articleService.updatePeople(par);
        } else {
            throw new HttpException('你没有修改权限', HttpStatus.I_AM_A_TEAPOT);
        }


        // return this.articleService.updateByIdAdmin(article.id, article);
    }

    /**
     * 获取所有家谱
     */
    @Get()
    @Roles()
    @HttpCode(HttpStatus.OK)
    // @UseGuards(JwtAuthGuard)
    findAll(@Query() queryParams) {
        return this.articleService.findAll(queryParams);
    }
    @Get('admin')
    @Roles('5', '9') // 过滤直接接口请求，带参数即放行的用户类型，5-9为admin
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findAllAdmin(@Query() queryParams) {
        const userId = queryParams.userId;
        return this.articleService.findAll(queryParams, userId, true);
    }
    @Get('catalog/:id')
    @Roles()
    findCatalog(@Param('id') id) {
        return this.articleService.findCatalog(id);
    }
    /**
     * 获取我的所有家谱
     */
    @Get('my')
    @Roles()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findMyAll(@Request() req, @Query() queryParams) {
        // console.log(req);
        const tokenUser = this.getTokenUser(req);

        return this.articleService.findAll(queryParams, tokenUser.id, true);
    }

    @Get('manage')
    @Roles()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findManage(@Request() req, @Query() queryParams) {
        // console.log(req);
        const tokenUser = this.getTokenUser(req);
        const qr = {
            ...queryParams,
            manageId: tokenUser.id,
        };
        return this.articleService.findAll(qr, null, true);
    }

    /**
     * 获取User所有家谱
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
        return this.articleService.findAll(queryParams, userId);
    }

    /**
     * 获取指定家谱
     * @param id
     */
    @Get(':id/:code')
    @Roles()
    async findById(@Request() req, @Param('id') id, @Param('code') code, @Query('status') status) {
        const sb = getClientIP(req);
        const existUser = await this.userService.checkUser(req);
        const xc = await RedisInstance.xMax(sb.device.d, 'v' + id);
        if (xc < 2) {
            this.articleService.updateViewsById(id, 0, 1);
        }
        try {
            const exist = await this.articleService.findById(id, null, 5);
            return this.articleService.findById(id, code, (exist.user && existUser.id === exist.user.id) ? 5 : existUser.role);
        } catch (e) {
            return this.articleService.findById(id, code);
        }
    }

    /**
     * 删除家谱
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
            return this.articleService.deleteById(id, userId, isAdmin);
        } catch (e) {
            return this.articleService.deleteById(id);
        }
        return this.articleService.deleteById(id);
    }

}
