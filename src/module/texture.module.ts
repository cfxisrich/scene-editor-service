import { Logger, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import FILE_PATH from '../constants/FILE_PATH';
import { TextureController } from '../controller/texture.controller';
import { TextureClassify } from '../entity/texture-classify.entity';
import { Texture } from '../entity/texture.entity';
import { TextureService } from '../service/texture.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Texture, TextureClassify]),
    MulterModule.register({
      dest: FILE_PATH.UPLOAD,
    }),
  ],
  controllers: [TextureController],
  providers: [TextureService, Logger],
  exports: [TextureService],
})
export class TextureModule {}
