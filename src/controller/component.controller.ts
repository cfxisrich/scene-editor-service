import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadComponentDTO } from '../DTO/component.dto';
import { AddClassifyDTO } from '../DTO/model.dto';
import { ComponentService } from '../service/component.service';
import { ResponseFormat } from '../util/ResponseFormat';
import { UploadComponentVO } from '../VO/component.vo';
import { AddClassifyVO } from '../VO/model.vo';

@Controller('component')
export class ComponentController {
  constructor(private componentService: ComponentService) {}

  @Post('structure')
  async getStructure(@Body('classifyId') classifyId: number) {
    classifyId = classifyId ? Number(classifyId) : null;

    return ResponseFormat.success(
      await this.componentService.getStructure(classifyId),
    );
  }

  @Post('addClassify')
  async addClassify(@Body() body: AddClassifyVO) {
    return ResponseFormat.success(
      await this.componentService.addClassify(
        new AddClassifyDTO({
          name: body.name,
          parentId: body.parentId ? Number(body.parentId) : null,
        }),
      ),
    );
  }

  @Post('removeClassify')
  async removeClassify(@Body('id') id: number) {
    return ResponseFormat.success(
      await this.componentService.removeClassify(id),
    );
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        // fileSize: 20971520, // 20M
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadComponentVO,
  ) {
    return ResponseFormat.success(
      await this.componentService.uploadComponent(
        new UploadComponentDTO({
          ...body,
          uploadPath: file.path,
          originalname: file.originalname,
          name: body.name || file.originalname.split('.').shift(),
        }),
      ),
    );
  }

  @Post('removeComponent')
  async removeComponent(
    @Body('id', ParseIntPipe) id: number,
    @Request() request,
  ) {
    return ResponseFormat.success(
      await this.componentService.removeComponent(id, request.user.id),
    );
  }

  @Get('/detail/:id')
  async getComponentDetail(
    @Param('id', ParseIntPipe) id: number,
    @Request() request,
  ) {
    return ResponseFormat.success(
      await this.componentService.getComponentDetail(id, request.user.id),
    );
  }
}
