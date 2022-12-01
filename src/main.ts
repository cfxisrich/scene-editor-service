import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExecptionFilter } from './filter/http-execption.filter';
import service from './config/service.json';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { PostStatusInterceptor } from './interceptor/Post-status.interceptor';
import cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import RESOURCES_PATH from './constants/RESOURCES_PATH';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(RESOURCES_PATH);

  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

  app.useGlobalFilters(new HttpExecptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transformOptions: { enableImplicitConversion: true },
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException(
          '请求参数有误：' +
            errors.map((error) =>
              JSON.stringify({
                key: error.property,
                value: error.value,
                message: Object.values(error.constraints).join(','),
              }),
            ),
        );
      },
    }),
  );

  app.useGlobalInterceptors(new PostStatusInterceptor());

  await app.listen(service.port);
}
bootstrap();
