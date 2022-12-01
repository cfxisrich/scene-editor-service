import {
  Body,
  Controller,
  Post,
  UseInterceptors,
  Request,
  ParseIntPipe,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AddClassifyDTO, UploadTextureDTO } from '../DTO/texture.dto';
import { TextureService } from '../service/texture.service';
import { ResponseFormat } from '../util/ResponseFormat';
import { AddClassifyVO, UploadModelVO } from '../VO/model.vo';

@Controller('texture')
export class TextureController {
  constructor(private textureService: TextureService) {}

  @Post('structure')
  async getStructure(@Body('classifyId') classifyId: number) {
    classifyId = classifyId ? Number(classifyId) : null;

    return ResponseFormat.success(
      await this.textureService.getStructure(classifyId),
    );
  }

  @Post('addClassify')
  async addClassify(@Body() body: AddClassifyVO) {
    return ResponseFormat.success(
      await this.textureService.addClassify(
        new AddClassifyDTO({
          name: body.name,
          parentId: body.parentId ? Number(body.parentId) : null,
        }),
      ),
    );
  }

  @Post('removeClassify')
  async removeClassify(@Body('id') id: number, @Request() request) {
    return ResponseFormat.success(
      await this.textureService.removeClassify(id, request.user.id),
    );
  }

  @Post('upload')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fieldSize: 20971520,
      },
    }),
  )
  async upload(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: UploadModelVO,
  ) {
    console.log(files);
    return ResponseFormat.success(
      await this.textureService.uploadTexture(
        files.map(
          (file) =>
            new UploadTextureDTO({
              ...body,
              uploadPath: file.path,
              originalname: file.originalname,
              packageName:
                body.packageName || file.originalname.split('.').shift(),
            }),
        ),
      ),
    );
  }

  @Post('removeModel')
  async removeModel(@Body('id', ParseIntPipe) id: number) {
    return ResponseFormat.success(await this.textureService.removeModel(id));
  }
}
