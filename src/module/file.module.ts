import { Logger, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import FILE_PATH from '../constants/FILE_PATH';
import { FileController } from '../controller/file.controller';
import { FileService } from '../service/file.service';
@Module({
  imports: [
    MulterModule.register({
      dest: FILE_PATH.UPLOAD,
    }),
  ],
  controllers: [FileController],
  providers: [FileService, Logger],
  exports: [FileService],
})
export class FileModule {}
