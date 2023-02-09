import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AddTemplateVO, TemplateModifyVO } from '../VO/template.vo';
import { TemplateService } from '../service/template.service';
import { ResponseFormat } from '../util/ResponseFormat';
import { TemplateModifyDTO } from '../DTO/template.dto';
import { AddClassifyVO } from '../VO/model.vo';
import { AddClassifyDTO } from '../DTO/model.dto';

@Controller('template')
export class TemplateController {
  constructor(private templateService: TemplateService) {}

  @Post('create')
  async create(@Body() apps: AddTemplateVO) {
    return ResponseFormat.success(
      await this.templateService.addTemplate(new AddTemplateVO(apps)),
    );
  }

  @Post('structure')
  async getStructure(@Body('classifyId') classifyId: number) {
    classifyId = classifyId ? Number(classifyId) : null;

    return ResponseFormat.success(
      await this.templateService.getStructure(classifyId),
    );
  }

  @Post('modify')
  async modify(@Body() body: TemplateModifyVO, @Request() request) {
    return ResponseFormat.success(
      await this.templateService.modifyTemplate(
        new TemplateModifyDTO({
          ...body,
        }),
      ),
    );
  }

  @Get('classifyList')
  async getClassifyList(
    @Request() request,
    @Query('classifyId') parentId?: number,
  ) {
    return ResponseFormat.success(
      await this.templateService.getClassifyList(parentId || null),
    );
  }

  @Post('detail')
  async getApp(@Body('id', ParseIntPipe) id: number) {
    return ResponseFormat.success(await this.templateService.getTemplate(id));
  }

  @Post('addClassify')
  async addClassify(@Body() body: AddClassifyVO, @Request() request) {
    return ResponseFormat.success(
      await this.templateService.addClassify(
        new AddClassifyDTO({
          name: body.name,
          parentId: body.parentId ? Number(body.parentId) : null,
        }),
      ),
    );
  }

  @Post('removeClassify')
  async removeClassify(
    @Body('id', ParseIntPipe) id: number,
    @Request() request,
  ) {
    return ResponseFormat.success(
      await this.templateService.removeClassify(id, request.user.id),
    );
  }
}
