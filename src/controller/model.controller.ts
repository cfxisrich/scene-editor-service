import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AddClassifyDTO, UploadModelDTO } from '../DTO/model.dto';
import { ModelService } from '../service/model.service';
import { ResponseFormat } from '../util/ResponseFormat';
import { AddClassifyVO, UploadModelVO } from '../VO/model.vo';

@Controller('model')
export class ModelController {
  constructor(private modelService: ModelService) {}

  @Post('structure')
  async getStructure(@Body('classifyId') classifyId: number) {
    classifyId = classifyId ? Number(classifyId) : null;

    return ResponseFormat.success(
      await this.modelService.getStructure(classifyId),
    );
  }

  @Post('addClassify')
  async addClassify(@Body() body: AddClassifyVO, @Request() request) {
    return ResponseFormat.success(
      await this.modelService.addClassify(
        new AddClassifyDTO({
          name: body.name,
          parentId: body.parentId ? Number(body.parentId) : null,
        }),
      ),
    );
  }

  @Post('removeClassify')
  async removeClassify(@Body('id') id: number) {
    return ResponseFormat.success(await this.modelService.removeClassify(id));
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      // limits: {
      //   fileSize: 20971520, // 20M
      // },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadModelVO,
  ) {
    return ResponseFormat.success(
      await this.modelService.uploadModel(
        new UploadModelDTO({
          ...body,
          uploadPath: file.path,
          originalname: file.originalname,
          packageName: body.packageName || file.originalname.split('.').shift(),
        }),
      ),
    );
  }

  @Post('removeModel')
  async removeModel(@Body('id', ParseIntPipe) id: number) {
    return ResponseFormat.success(await this.modelService.removeModel(id));
  }
}
