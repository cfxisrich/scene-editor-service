import { Logger, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import FILE_PATH from '../constants/FILE_PATH';
import { ComponentController } from '../controller/component.controller';
import { ComponentClassify } from '../entity/component-classify.entity';
import { Component } from '../entity/component.entity';
import { ComponentService } from '../service/component.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Component, ComponentClassify]),
    MulterModule.register({
      dest: FILE_PATH.UPLOAD,
    }),
  ],
  controllers: [ComponentController],
  providers: [ComponentService, Logger],
  exports: [ComponentService],
})
export class ComponentsModule {}
