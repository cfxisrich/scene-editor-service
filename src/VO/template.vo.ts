import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectConstructor } from '../util/Constructor';

@Exclude()
export class AddTemplateVO extends ObjectConstructor<AddTemplateVO> {
  @Expose()
  @IsString()
  templateName: string;

  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsString()
  config: string;

  @Expose()
  @IsString()
  preview: string;
}

@Exclude()
export class TemplateModifyVO extends ObjectConstructor<TemplateModifyVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  templateName: string;

  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsString()
  preview: string;

  @Expose()
  @IsString()
  config: string;
}

@Exclude()
export class TemplateDetailVO extends ObjectConstructor<TemplateDetailVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsDate()
  modifyTime: string;

  @Expose()
  @IsString()
  preview: string;

  @Expose()
  @IsString()
  config: string;
}

@Exclude()
export class TemplateClassifyDetailVO extends ObjectConstructor<TemplateClassifyDetailVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsBoolean()
  dir: boolean;

  @Expose()
  @IsInt()
  level: number;

  @Expose()
  @IsInt()
  parentId: number;
}
