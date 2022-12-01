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
export class AppDetailVO extends ObjectConstructor<AppDetailVO> {
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
  app: string;
}

@Exclude()
export class AppClassifyDetailVO extends ObjectConstructor<AppClassifyDetailVO> {
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

@Exclude()
export class AppsCreateVO extends ObjectConstructor<AppsCreateVO> {
  @Expose()
  @IsString()
  appName: string;

  @Expose()
  @IsInt()
  classifyId: number;
}

@Exclude()
export class AppsModifyVO extends ObjectConstructor<AppsModifyVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  config: string;

  @Expose()
  @IsString()
  preview: string;
}
