import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UseGuards,
    Request, HttpException, HttpStatus,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ManageService } from './manage.service';

@Controller('manage')
@UseGuards(RolesGuard)
export class ManageController {
    constructor(
        private readonly manageService: ManageService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * 创建审核
     * @param manage
     */
    @Post()
    @Roles()
    create(@Request() req, @Body() manage) {
        if (!manage.hostId) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        if (!manage.content || manage.content.length < 11) {
            throw new HttpException('请认真输入申请内容', HttpStatus.BAD_REQUEST);
        }
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (!tokenUser) {
            throw new HttpException('你还没有登录', HttpStatus.BAD_REQUEST);
        }
        return this.manageService.create(manage, tokenUser);
    }

    /**
     * 获取所有审核
     */
    @Get()
    @Roles('5', '9')
    findAll(@Query() queryParams) {
        return this.manageService.findAll(queryParams);
    }
    @Post('check')
    @Roles()
    checkManage(@Request() req, @Body() manage) {
        if (!manage || !manage.id) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (!tokenUser) {
            throw new HttpException('你还没有登录', HttpStatus.BAD_REQUEST);
        }
        return this.manageService.checkManage(manage.id, tokenUser.id);
    }
    @Post('review')
    @Roles()
    reviewManage(@Request() req, @Body() manage) {
        if (!manage || !manage.id || !manage.pass) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (!tokenUser) {
            throw new HttpException('你还没有登录', HttpStatus.BAD_REQUEST);
        }
        return this.manageService.reviewManage(manage.id, manage.pass, tokenUser.id);
    }
    @Get('my')
    @Roles()
    @UseGuards(JwtAuthGuard)
    findByUserId(@Request() req, @Query() queryParams) {
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (!tokenUser) {
            throw new HttpException('你还没有登录', HttpStatus.BAD_REQUEST);
        }
        return this.manageService.findMy(tokenUser.id, queryParams);
    }

    @Get('admin')
    @Roles('5', '9')
    findByAdmin(@Query() queryParams) {
        return this.manageService.findAll(queryParams, true);
    }

    /**
     * 获取指定审核
     * @param id
     */
    @Get(':id')
    @Roles()
    findById(@Param('id') id) {
        return this.manageService.findById(id);
    }
    /**
     * 获取审核
     * @param hostId
     */
    @Get('host/:hostId')
    @Roles()
    getArticleManages(@Param('hostId') hostId, @Query() qurey) {
        return this.manageService.getArticleManages(hostId, qurey);
    }

    /**
     * 删除审核
     * @param id
     */
    @Post(':id')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    deleteById(@Param('id') id) {
        return this.manageService.deleteById(id);
    }
}
