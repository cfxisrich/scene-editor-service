import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Template } from '../entity/template.entity';
import { TemplateClassify } from '../entity/template-classify.entity';
import { TemplateController } from '../controller/template.controller';
import { TemplateService } from '../service/template.service';

@Module({
  imports: [TypeOrmModule.forFeature([Template, TemplateClassify])],
  controllers: [TemplateController],
  providers: [TemplateService, Logger],
  exports: [TemplateService],
})
export class TemplateModule {}
