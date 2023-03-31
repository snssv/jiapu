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
import { CommentService } from './comment.service';
import { Comment } from './comment.entity';

@Controller('comment')
@UseGuards(RolesGuard)
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * 创建评论
     * @param comment
     */
    @Post()
    @Roles()
    create(@Request() req, @Body() comment) {
        // const userAgent = req.headers['user-agent'];
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (!tokenUser) {
            throw new HttpException('请登录后再留言', HttpStatus.I_AM_A_TEAPOT);
        }
        return this.commentService.create(req, tokenUser ? tokenUser.id : null, comment);
    }

    /**
     * 获取所有评论
     */
    @Get()
    @Roles()
    findAll(@Query() queryParams) {
        return this.commentService.findAll(queryParams);
    }
    @Get('my')
    @Roles()
    @UseGuards(JwtAuthGuard)
    findByUserId(@Request() req) {
        let token = req.headers.authorization;

        if (/Bearer/.test(token)) {
            // 不需要 Bearer，否则验证失败
            token = token.split(' ').pop();
        }
        const tokenUser = this.jwtService.decode(token) as any;
        if (tokenUser&&tokenUser.id) {
            return this.commentService.findAll({user:tokenUser.id});
        } else {

        }
    }

    @Get('admin')
    @Roles('5','9')
    findByAdmin(@Query() queryParams) {
        return this.commentService.findAll(queryParams,true);
    }

    /**
     * 获取指定评论
     * @param id
     */
    @Get(':id')
    @Roles()
    findById(@Param('id') id) {
        return this.commentService.findById(id);
    }

    /**
     * 获取家谱或页面评论
     * @param hostId
     */
    @Get('host/:hostId')
    @Roles()
    getArticleComments(@Param('hostId') hostId, @Query() qurey) {
        return this.commentService.getArticleComments(hostId, qurey);
    }

    /**
     * 更新评论
     * @param id
     * @param tag
     */
    // @Patch(':id')
    // @Roles('admin')
    // @UseGuards(JwtAuthGuard)
    // updateById(@Param('id') id, @Body() data) {
    //     return this.commentService.updateById(id, data);
    // }

    /**
     * 删除评论
     * @param id
     */
    @Post('delete/:id')
    @Roles()
    @UseGuards(JwtAuthGuard)
    deleteById(@Param('id') id) {
        return this.commentService.deleteById(id);
    }
}
