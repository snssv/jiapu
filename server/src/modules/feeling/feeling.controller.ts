import {
    Controller,
    Get,
    Post,
    Query,
    Body,
    UseGuards,
    Request, HttpException, HttpStatus, HttpCode,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { FeelingService } from './feeling.service';
import { Feeling } from './feeling.entity';

@Controller('feeling')
@UseGuards(RolesGuard)
export class FeelingController {
    constructor(
        private readonly feelingService: FeelingService,
        private readonly jwtService: JwtService
    ) {}

    /**
     * 创建评论
     * @param feeling
     */
    @Post()
    @Roles()
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() feeling) {
        // const userAgent = req.headers['user-agent'];
        const {hostId,type} = feeling;
        if (!hostId || !type&&type!=0) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        return this.feelingService.create(tokenUser.id, feeling);


    }

    /**
     * 获取所有评论
     */
    @Get('my')
    @Roles()
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    findOne(@Request() req, @Query() queryParams) {
        const {hostId} = queryParams;
        if (!hostId ) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        return this.feelingService.findByOne(tokenUser.id,hostId);
    }

    @Get()
    @Roles()
    @HttpCode(HttpStatus.OK)
    findAll(@Query() queryParams) {
        const {hostId} = queryParams;
        if (!hostId ) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        return this.feelingService.findAll(queryParams);
    }

}
