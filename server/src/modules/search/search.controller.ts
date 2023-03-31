import {
    Controller,
    Get,
    Delete,
    Param,
    UseGuards,
    Query, Post, Request, Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
// import { client } from './elasticsearch.client';
import { SearchService } from './search.service';
import {UserService} from '../user/user.service';

@Controller('search')
@UseGuards(RolesGuard)
export class SearchController {
    constructor(
        private readonly searchService: SearchService,
        private readonly userService: UserService,
    ) {}

    /**
     * 搜索家谱
     * @param keyword
     */
    @Get('/all')
    @Roles()
    async searchArticle(@Query() queryParam) {
        const data = await this.searchService.searchArticle(queryParam.type, queryParam.keyword);
        return data;
    }

    /**
     * 获取搜索记录
     */
    @Get('/hot')
    @Roles()
    async findAll( @Request() req, @Query() queryParam) {
        const existUser = await this.userService.checkUser(req);
        return this.searchService.findAll(queryParam, existUser && existUser.role >= 5);
    }

    /**
     * 删除文件
     * @param id
     */
    @Post('del/:id')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    deleteById(@Param('id') id) {
        return this.searchService.deleteById(id);
    }
    @Post('changeLock/:id')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    changeLock(@Param('id') id) {
        return this.searchService.changeLock(id);
    }
}
