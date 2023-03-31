import {
    Controller,
    Get,
    HttpStatus,
    HttpCode,
    Post,
    Query,
    Body,
    Request,
    UseGuards,
    UseInterceptors,
    HttpException,
    ClassSerializerInterceptor, Param,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import {getClientIP, UserService} from './user.service';
import { User } from './user.entity';

@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) {}

    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    @Roles('admin')
    @UseGuards(JwtAuthGuard)
    findAll(@Query() query) {
        return this.userService.findAll(query);
    }

    @Get('author')
    findAuthor(@Query() query) {
        return this.userService.findAll({...query, author: true});
    }

    @Get('admin')
    @Roles('5', '9') // 过滤直接接口请求，带参数即放行的用户类型，5-9为admin
    @HttpCode(HttpStatus.OK)
    findAllAdmin(@Query() queryParams) {
        return this.userService.findAll(queryParams, true);
    }
    /**
     * 用户注册
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('register')
    @Roles()
    @HttpCode(HttpStatus.CREATED)
    async register(@Request() req, @Body() user: Partial<User>): Promise<User> {
        return await this.userService.createUser(req, user);
    }

    async checkPermission(req, user) {
        const exist = await this.userService.checkUser(req);
        if (exist.id !== user.id && exist.role < 1) {
            throw new HttpException('无权处理', HttpStatus.FORBIDDEN);
        }
    }

    /**
     * 用户更新
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('update')
    @Roles()
    @HttpCode(HttpStatus.CREATED)
    async update(@Request() req, @Body() user: Partial<User>): Promise<User> {
        await this.checkPermission(req, user);
        return await this.userService.updateById(user.id, user);
    }

    @Post('upload')
    @Roles()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard)
    async avatar(@Request() req, @Body() file): Promise<User> {
        const user = await this.userService.checkUser(req, 1);
        // console.log('上传', user)
        return await this.userService.updateByIdAvatar(user.id, file).then( res => {
            throw new HttpException('上传成功', HttpStatus.OK);
        });
    }

    @Get(':id')
    @Roles()
    async findById(@Request() req, @Param('id') id, @Query('status') status) {
        // const sb = getClientIP(req);
        // const existUser = await this.userService.checkUser(req);
        return this.userService.findById(id);
    }
    @Post('get_pwd1')
    @Roles()
    async getPwd1(@Body() body) {
        if (!body || !body.username) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        return this.userService.getPwd1(body);
    }
    @Post('get_pwd2')
    @Roles()
    async getPwd2(@Body() body) {
        if (!body || !body.username || !body.pwdA) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        return this.userService.getPwd2(body);
    }
    @Post('get_pwd3')
    @Roles()
    async getPwd3(@Body() body) {
        if (!body || !body.username || !body.pwdA || !body.password) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        return this.userService.getPwd3(body);
    }

    /**
     * 更新用户密码
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('password')
    @Roles()
    @HttpCode(HttpStatus.CREATED)
    async updatePassword( @Request() req, @Body() user: Partial<User>): Promise<User> {
        const existUser = await this.userService.checkUser(req);
        // console.log(existUser.id)
        // await this.checkPermission(req, user);
        // console.log(user.id)
        if (!existUser.id || /visitors/.test(existUser.id)) {
            throw new HttpException('用户未登录', HttpStatus.FORBIDDEN);
        }
        return await this.userService.updatePassword(existUser.id, user);
    }

    /**
     * 更新用户密码
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('password/admin')
    @Roles('9')
    @HttpCode(HttpStatus.CREATED)
    async updatePasswordAdmin( @Body() user ): Promise<User> {
        const userB = await this.userService.findById(user.id);
        if (!user.id || !userB) {
            throw new HttpException('用户不存在', HttpStatus.NOT_FOUND);
        }
        return await this.userService.updatePasswordAdmin(user.id, user.password);
    }
}
