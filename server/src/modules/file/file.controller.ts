import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    UseGuards, Request, HttpException, HttpStatus, Body, HttpCode,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
// import {FileFieldsInterceptor, FileInterceptor} from '@nestjs/platform-express';
import { FileService } from './file.service';
import {getClientIP, UserService} from '../user/user.service';
import {User} from '../user/user.entity';
import {RedisInstance} from '../chat/redis';
// import {intersect} from '@hapi/hoek';
// import Array = intersect.Array;

@Controller('file')
@UseGuards(RolesGuard)
export class FileController {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly fileService: FileService
    ) {}

    /**
     * 上传文件
     * @param file
     */
    @Post('upload')
    // @Roles()
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(JwtAuthGuard)
    async avatar(@Request() req, @Body() file): Promise<User> {
        const sb = getClientIP(req);
        // 这里要把用户device 用redis存起来，游客每天不能超过10条免得大量垃圾信息
        // role<5 用户 每天不能超过50条
        const existUser = await this.userService.checkUser(req);
        const xa = existUser.role < 5;
        const xb = /visitors/.test(existUser.id);
        const xc = await RedisInstance.xMax(sb.device.d, 'upimg');
        // console.log('上传', xc);
        if (xb || xa && (!xb && xc > 100 || xb && xc > 10)) {
            throw new HttpException('你今天发得太多了，歇会吧', HttpStatus.TOO_MANY_REQUESTS);
        }
        return this.fileService.uploadFile(existUser.id, file).then();
    }
    /**
     * 获取所有文件
     */
    @Get()
    @Roles('5', '9')
    findAll(@Query() queryParam) {
        return this.fileService.findAll(queryParam);
    }

    @Get('my')
    @Roles()
    @UseGuards(JwtAuthGuard)
    findMyAll(@Request() req) {
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        try {
            const tokenUser = this.jwtService.decode(token) as any;
            const userId = tokenUser.id;
            return this.fileService.findAll({url:userId});
        } catch (e) {
            throw new HttpException('没有权限', HttpStatus.UNAUTHORIZED);
        }

    }
    @Get('document')
    @Roles('5', '9')
    @UseGuards(JwtAuthGuard)
    getDocument() {
        return this.fileService.getDocument();
    }
    @Post('document')
    @Roles('5', '9')
    postDocument(@Body() par) {
        return this.fileService.postDocument(par);
    }
    @Post('document/delete')
    @Roles('5', '9')
    postDocumentDelete(@Body() par) {
        return this.fileService.postDocumentDelete(par);
    }


    /**
     * 获取指定文件
     * @param id
     */
    @Get(':id')
    @Roles()
    findById(@Param('id') id) {
        return this.fileService.findById(id);
    }

    /**
     * 删除文件
     * @param id
     */
    @Post('delete/:id')
    @Roles()
    @UseGuards(JwtAuthGuard)
    deleteById(@Request() req,  @Param('id') id) {
        let token = req.headers.authorization;
        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        try {
            const tokenUser = this.jwtService.decode(token) as any;
            const userId = tokenUser.id;
            return this.fileService.deleteById(userId, id,tokenUser.role>=5);
        } catch (e) {
            throw new HttpException('没有权限', HttpStatus.I_AM_A_TEAPOT);
        }
    }
}
