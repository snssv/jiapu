import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Query,
    Body,
    UseGuards, UseInterceptors, ClassSerializerInterceptor, HttpCode, HttpStatus, Request, HttpException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { SMTPService } from './smtp.service';
import {JwtService} from "@nestjs/jwt";
import {UserService} from "../user/user.service";
import {SMTP} from "./smtp.entity";

@Controller('smtp')
@UseGuards(RolesGuard)
export class SMTPController {
    constructor(
        private readonly smtpService: SMTPService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    /**
     * 发送邮件
     * @param data
     */
    @Post('send_email')
    @Roles()
    @UseGuards(JwtAuthGuard)
    create(@Body() data) {
        return this.smtpService.create(data);
    }

    /**
     * 发送绑定邮箱验证码邮件
     * @param user
     */
    @UseInterceptors(ClassSerializerInterceptor)
    @Post('send_email_code')
    @Roles()
    @HttpCode(HttpStatus.CREATED)
    async send_email_code(@Request() req) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;

        let user = await this.userService.findById(tokenUser.id);
        if (user.emailAuth) {
            throw new HttpException('邮箱已经认证', HttpStatus.OK);
        }

        let smtp = new  SMTP();

        smtp.to = user.email;
        smtp.subject = "邮箱绑定验证码";
        smtp.text = "123456";

        return this.smtpService.create(smtp);
    }

    /**
     * 获取所有邮件记录
     */
    @Get()
    @Roles()
    @UseGuards(JwtAuthGuard)
    findAll(@Query() queryParam) {
        return this.smtpService.findAll(queryParam);
    }

    /**
     * 删除邮件记录
     * @param id
     */
    @Post(':id')
    @Roles('5','9')
    @UseGuards(JwtAuthGuard)
    deleteById(@Param('id') id) {
        return this.smtpService.deleteById(id);
    }
}
