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
import { BackupService } from './backup.service';

@Controller('backup')
@UseGuards(RolesGuard)
export class BackupController {
    constructor(
        private readonly backupService: BackupService,
        private readonly jwtService: JwtService,
    ) {}
    @Post(':id')
    @Roles()
    create(@Request() req, @Param('id') id) {
        if (!id) {
            throw new HttpException('参数缺失', HttpStatus.BAD_REQUEST);
        }
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (!tokenUser) {
            throw new HttpException('你还没有登录', HttpStatus.BAD_REQUEST);
        }
        return this.backupService.create(id, tokenUser);
    }
    @Get(':id')
    @Roles()
    findAll(@Param('id') id) {
        return this.backupService.findAll(id);
    }
    @Post('delete/:id')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    deleteById(@Param('id') id) {
        return this.backupService.deleteById(id);
    }
}
