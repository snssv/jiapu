import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    UseGuards,
    Body,
    Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ViewService } from './view.service';


import { getClientIP } from '../user/user.service';

@Controller('view')
@UseGuards(RolesGuard)
export class ViewController {
    constructor(private readonly viewService: ViewService) {}

    /**
     * 添加访问
     * @param tag
     */
    @Post()
    @Roles()
    create(@Request() req, @Body() data) {
        const userAgent = req.headers['user-agent'];
        const url = data.url;
        const sb = getClientIP(req)
        return this.viewService.create(sb.ip, sb.device.d, userAgent, url);
    }

    /**
     * 获取所有访问
     */
    @Get()
    @Roles()
    @UseGuards(JwtAuthGuard)
    findAll(@Query() queryParam) {
        return this.viewService.findAll(queryParam);
    }

    /**
     * 获取指定访问
     * @param id
     */
    @Get('/url')
    @Roles()
    findByUrl(@Query('url') url) {
        return this.viewService.findByUrl(url);
    }

    /**
     * 获取指定访问
     * @param id
     */
    @Get(':id')
    @Roles()
    @UseGuards(JwtAuthGuard)
    findById(@Param('id') id) {
        return this.viewService.findById(id);
    }

    /**
     * 更新页面
     * @param id
     * @param page
     */
    @Patch(':id')
    @Roles()
    updateIpAddress(@Param('id') id, @Body() info) {
        return this.viewService.updateIpAddress(id, info);
    }

    /**
     * 删除访问
     * @param id
     */
    @Delete(':id')
    @Roles('5','9')
    @UseGuards(JwtAuthGuard)
    deleteById(@Param('id') id) {
        return this.viewService.deleteById(id);
    }
}
