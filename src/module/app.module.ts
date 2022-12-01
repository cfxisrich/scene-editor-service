import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from '../controller/app.controller';
import { AppClassify } from '../entity/app-classify.entity';
import { App } from '../entity/app.entity';
import { AppService } from '../service/app.service';
import { ComponentsModule } from './component.module';
import { ModelModule } from './model.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([App, AppClassify]),
    ComponentsModule,
    ModelModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
  exports: [AppService],
})
export class AppModule {}
