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
import {Roles, RolesGuard} from "../auth/roles.guard";
import {FollowsService} from "./follows.service";
import {JwtService} from "@nestjs/jwt";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";


@Controller('follows')
@UseGuards(RolesGuard)
export class FollowsController {
    constructor(
        private readonly followsService: FollowsService,
        private readonly jwtService: JwtService
    ) {}

    @Post()
    @Roles()
    create(@Request() req, @Body() follows) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        // console.log(1122211);

        const tokenUser = this.jwtService.decode(token) as any;
        const userId = tokenUser.id;
        // console.log(userId);
        return this.followsService.create(follows,userId)

    }

    @Get('my')
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
            return this.followsService.findAll(queryParams,userId);
        } else {
            throw new HttpException('没有登录', HttpStatus.UNAUTHORIZED);
        }
    }
}
