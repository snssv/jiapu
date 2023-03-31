import {
    Controller,
    Post,
    Body,
    Request,
    UseGuards,
    HttpCode,
    HttpStatus, Get,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { SettingService } from './setting.service';
import { Setting } from './setting.entity';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';

@Controller('setting')
@UseGuards(RolesGuard)
export class SettingController {
    constructor(
        private readonly settingService: SettingService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    /**
     * 更新设置
     * @param tag
     */
    @Post()
    @Roles('9')
    @UseGuards(JwtAuthGuard)
    update(@Body() setting) {
        return this.settingService.update(setting);
    }

    /**
     * 获取设置
     */
    @Get('')
    @Roles('5','9')
    @HttpCode(HttpStatus.OK)
    async findAll(): Promise<Setting> {
        return this.settingService.findAll(false, true);
    }
}
