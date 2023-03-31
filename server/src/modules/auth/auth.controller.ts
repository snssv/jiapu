import {
    Controller,
    HttpStatus,
    HttpCode,
    Post,
    Body,
    UseInterceptors,
    ClassSerializerInterceptor, Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {Roles} from "./roles.guard";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * 用户注册
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('signup')
    @Roles()
    @HttpCode(HttpStatus.OK)
    async signup(@Request() req, @Body() user) {
        return await this.authService.signup(req, user);
    }
    /**
     * 用户登录
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('signin')
    @Roles()
    @HttpCode(HttpStatus.OK)
    async signin(@Body() user) {
        return await this.authService.signin(user);
    }
    /**
     * 用户登录
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('signin/admin')
    @Roles()
    @HttpCode(HttpStatus.OK)
    async signinAdmin(@Body() user) {
        return await this.authService.signin(user,true);
    }
}
