import { NestFactory } from '@nestjs/core';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const limiter = rateLimit({
        windowMs: 30 * 60 * 1000,
        max: 10,
        message: {statusCode:429,msg:'请求过于频繁!'}
    });
    app.enableCors();
    app.setGlobalPrefix('/api');
    app.use(
        rateLimit({
            windowMs: 60 * 1000, // 1 minutes
            max: 1000, // limit each IP to 1000 requests per windowMs
            message: {statusCode:429,msg:'请求过于频繁!'}
        })
    );
    app.use('/api/auth/signin', limiter);
    app.use('/api/auth/signup', limiter);
    app.use(compression()); // 启用 gzip 压缩
    app.use(helmet());
    app.use(bodyParser.json({limit: '5mb'}));
    app.useGlobalInterceptors(new TransformInterceptor()); // 正常情况下，响应值统一
    app.useGlobalFilters(new HttpExceptionFilter()); // 异常情况下，响应值统一

    await app.listen(3016);
}

bootstrap();
