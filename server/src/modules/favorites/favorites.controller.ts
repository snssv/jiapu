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
import { FavoritesService } from './favorites.service';
import { Favorites } from './favorites.entity';

@Controller('favorites')
@UseGuards(RolesGuard)
export class FavoritesController {
    constructor(
        private readonly favoritesService: FavoritesService,
        private readonly jwtService: JwtService
    ) {}

    /**
     * 创建评论
     * @param favorites
     */
    @Post()
    @Roles()
    @UseGuards(JwtAuthGuard)
    create(@Request() req, @Body() favorites) {
        // const userAgent = req.headers['user-agent'];
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;

        return this.favoritesService.create(tokenUser.id, favorites);
    }

    /**
     * 获取所有评论
     */
    @Get()
    @Roles('5','9')
    findAll(@Query() queryParams) {
        return this.favoritesService.findAll(queryParams);
    }

    @Get('my')
    @Roles()
    @UseGuards(JwtAuthGuard)
    findMyAll(@Request() req,@Query() queryParams) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;

        return this.favoritesService.findAll(queryParams,tokenUser.id);
    }

    /**
     * 删除评论
     * @param id
     */
    @Post('delete')
    @Roles()
    @UseGuards(JwtAuthGuard)
    deleteById(@Body() favorites) {
        return this.favoritesService.deleteById(favorites);
    }
}
