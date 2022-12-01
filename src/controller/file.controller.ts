import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClassifyDTO, FileDTO, UploadFileDTO } from '../DTO/file.dto';
import { FileService } from '../service/file.service';
import { ResponseFormat } from '../util/ResponseFormat';

@Controller('file')
export class FileController {
  constructor(private fileService: FileService) {}

  @Post('structure')
  async getUserFileStructure(@Body() params: FileDTO, @Request() request) {
    params.id = request.user.id;
    !params.url && (params.url = '');

    if (params.type === 'models') {
      return ResponseFormat.success(
        await this.fileService.getModelStructure(params),
      );
    } else if (params.type === 'components') {
      return ResponseFormat.success(
        await this.fileService.getComponentStructure(params),
      );
    }

    const files = await this.fileService.getFileStructure(params);
    return ResponseFormat.success(files);
  }

  @Post('addClassify')
  async addClassify(@Body() params: ClassifyDTO, @Request() request) {
    params.id = request.user.id;
    !params.url && (params.url = '');

    try {
      return ResponseFormat.success(await this.fileService.addClassify(params));
    } catch (error) {
      return ResponseFormat.error(error.message);
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 20971520, // 20M
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileDTO,
    @Request() request,
  ) {
    const uploadFile = new UploadFileDTO(body);
    uploadFile.uploadPath = file.path;
    uploadFile.originalname = file.originalname;
    uploadFile.id = request.user.id;
    console.log(uploadFile);

    if (body.type === 'models') {
      try {
        return ResponseFormat.success(
          await this.fileService.uploadModel(uploadFile),
        );
      } catch (error) {
        return ResponseFormat.error(error.message);
      }
    } else if (body.type === 'components') {
      try {
        return ResponseFormat.success(
          await this.fileService.uploadComponent(uploadFile),
        );
      } catch (error) {
        return ResponseFormat.error(error.message);
      }
    }
    return ResponseFormat.success(true);
  }

  @Get('/:role/:type/:url(*+)')
  async getUserFile(@Param() params, @Request() request) {
    const file = new FileDTO({
      id: request.user.id,
      role: params.role,
      type: params.type,
      url: decodeURI('/' + params.url),
    });
    try {
      const streamableFile = this.fileService.getStreamableFile(file);
      return streamableFile;
    } catch (error) {
      return ResponseFormat.error(error.message);
    }
  }
}
