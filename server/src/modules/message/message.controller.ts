import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Post,
    Query,
    Request,
    UseGuards
} from '@nestjs/common';
import {Roles, RolesGuard} from '../auth/roles.guard';
import {MessageService} from './message.service';
import {JwtService} from '@nestjs/jwt';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';


@Controller('message')
@UseGuards(RolesGuard)
export class MessageController {
    constructor(
        private readonly messageService: MessageService,
        private readonly jwtService: JwtService
    ) {}

    @Post()
    @Roles()
    create(@Request() req, @Body() message) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        // console.log(1122211);

        const tokenUser = this.jwtService.decode(token) as any;
        const userId = tokenUser.id;
        // console.log(userId);
        return this.messageService.create(message,userId)

    }

    @Get()
    @Roles()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findAll(@Request() req, @Query() queryParams) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }

        const tokenUser = this.jwtService.decode(token) as any;
        const userId = tokenUser.id;
        // console.log(userId);
        // console.log(1122211);
        if (userId) {
            return this.messageService.findAll(queryParams, userId);
        } else {
            throw new HttpException('没有登录', HttpStatus.UNAUTHORIZED);
        }
    }

    @Get('new')
    @Roles()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findAllNew(@Request() req, @Query() queryParams) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }

        const tokenUser = this.jwtService.decode(token) as any;
        const userId = tokenUser.id;
        // console.log(userId);
        // console.log(1122211);
        if (userId) {
            return this.messageService.findAll({status:0},userId);
        } else {
            throw new HttpException('没有登录', HttpStatus.UNAUTHORIZED);
        }
    }
}
