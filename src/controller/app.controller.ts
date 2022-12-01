import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { AppCreateDTO, AppModifyDTO } from '../DTO/app.dto';
import { AddClassifyDTO } from '../DTO/model.dto';
import { AppService } from '../service/app.service';
import { ResponseFormat } from '../util/ResponseFormat';
import { AppsCreateVO, AppsModifyVO } from '../VO/app.vo';
import { AddClassifyVO } from '../VO/model.vo';

@Controller('app')
export class AppController {
  constructor(private appService: AppService) {}

  @Post('create')
  async create(@Body() apps: AppsCreateVO) {
    return ResponseFormat.success(
      await this.appService.addApp(new AppCreateDTO(apps)),
    );
  }

  @Post('structure')
  async getStructure(@Body('classifyId') classifyId: number) {
    classifyId = classifyId ? Number(classifyId) : null;

    return ResponseFormat.success(
      await this.appService.getStructure(classifyId),
    );
  }

  @Post('modify')
  async modify(@Body() body: AppsModifyVO, @Request() request) {
    return ResponseFormat.success(
      await this.appService.modifyApp(
        new AppModifyDTO({
          ...body,
        }),
      ),
    );
  }

  @Post('build')
  async build(@Body('id') id: number, @Request() request) {
    return ResponseFormat.success(await this.appService.buildApp(id));
  }

  @Get('list')
  async getList(
    @Request() request,
    @Query('classifyId', ParseIntPipe) classifyId: number,
  ) {
    return ResponseFormat.success(
      await this.appService.getAppList(request.user.id, classifyId),
    );
  }

  @Get('classifyList')
  async getClassifyList(
    @Request() request,
    @Query('classifyId') parentId?: number,
  ) {
    return ResponseFormat.success(
      await this.appService.getClassifyList(request.user.id, parentId || null),
    );
  }

  @Post('detail')
  async getApp(@Body('id', ParseIntPipe) id: number) {
    return ResponseFormat.success(await this.appService.getApp(id));
  }

  @Post('addClassify')
  async addClassify(@Body() body: AddClassifyVO, @Request() request) {
    return ResponseFormat.success(
      await this.appService.addClassify(
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
      await this.appService.removeClassify(id, request.user.id),
    );
  }
}
