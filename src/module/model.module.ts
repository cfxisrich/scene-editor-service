import { Logger, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import FILE_PATH from '../constants/FILE_PATH';
import { ModelController } from '../controller/model.controller';
import { ModelClassify } from '../entity/model-classify.entity';
import { Model } from '../entity/model.entiry';
import { ModelService } from '../service/model.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Model, ModelClassify]),
    MulterModule.register({
      dest: FILE_PATH.UPLOAD,
    }),
  ],
  controllers: [ModelController],
  providers: [ModelService, Logger],
  exports: [ModelService],
})
export class ModelModule {}
