import { Controller } from '@nestjs/common';
import {ArticleService} from "../article/article.service";

@Controller('account')
export class AccountController {
    constructor(
        private readonly accountService: ArticleService,
    ) {}
}
