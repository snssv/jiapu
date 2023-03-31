import {
    Controller,
    Post,
    HttpCode,
    Get,
    Body,
    Query,
    Patch,
    Param,
    Delete,
    UseGuards,
    Request,
    HttpStatus, HttpException
} from '@nestjs/common';
import { GroupService } from './group.service'
import { AuthGuard } from '@nestjs/passport';
import {RolesGuard,Roles} from "../auth/roles.guard";
import {JwtService} from "@nestjs/jwt";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

// function getTokenUser(req) {
//     let tokenUser = null;
//     if (req.headers.authorization) {
//         let token = req.headers.authorization.split('@Mira&')[0];
//         if (/Bearer/.test(token)) {
//             // 不需要 Bearer，否则验证失败
//             token = token.split(' ').pop();
//         }
//         tokenUser = this.jwtService.decode(token) as any;
//     }
//     return tokenUser;
// }


@Controller('group')
@UseGuards(RolesGuard)
export class GroupController {
    constructor(
        private readonly groupService: GroupService,
        private readonly jwtService: JwtService,
    ) {}


    getTokenUser(req) {
        let tokenUser = null;
        if (req.headers.authorization) {
            let token = req.headers.authorization.split('@Mira&')[0];
            if (/Bearer/.test(token)) {
                // 不需要 Bearer，否则验证失败
                token = token.split(' ').pop();
            }
            tokenUser = this.jwtService.decode(token) as any;
        }
        return tokenUser;
    }

    @Get()
    @Roles()
    @HttpCode(HttpStatus.OK)
    getAllGroups(@Query() queryParams, @Request() req) {
        let tokenUser = this.getTokenUser(req) || {role:0}
        return this.groupService.findAll(queryParams,tokenUser.role)
    }

    @Post('join')
    @Roles()
    @UseGuards(JwtAuthGuard)
    joinGroups(@Body() par, @Request() req) {

        const tokenUser = this.getTokenUser(req);

        return this.groupService.joinGroups({...par, user: tokenUser})
    }



    @Post('invitation')
    @Roles()
    @UseGuards(JwtAuthGuard)
    invitationConfirm(@Request() req, @Body() par) {
        const tokenUser = this.getTokenUser(req);
        return this.groupService.joinGroupsInv(par,tokenUser.id)
        // const vd =  this.groupService.findUserGroups({groupId:par.groupId,userId:tokenUser.id})
        // console.log(par);
        // console.log(vd);
        // if (vd && vd[1]>0  && vd[0][0].role>0) {
        // } else {
        //     throw new HttpException('你没有该群管理权限', HttpStatus.NOT_FOUND);
        // }

    }


    @Get('invitation')
    @Roles()
    @UseGuards(JwtAuthGuard)
    getUserGroups(@Request() req) {
        const tokenUser = this.getTokenUser(req);
        return this.groupService.findUserGroups({host : tokenUser.id, status:0})
    }



    @Get('users')
    @Roles()
    @UseGuards(JwtAuthGuard)
    getGroupUsers(@Query() par) {
        return this.groupService.findUserGroups(par)
    }

    // @Get('messages')
    // getGroupMessages(@Query('groupId') groupId: string) {
    //     return this.groupService.getGroupMessages(groupId);
    // }
    //
    // @Get('findByName')
    // getGroupsByName(@Query('groupName') groupName: string) {
    //     return this.groupService.getGroupsByName(groupName);
    // }
}
