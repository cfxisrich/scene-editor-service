import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ObjectConstructor } from '../util/Constructor';

@Exclude()
export class UploadComponentVO extends ObjectConstructor<UploadComponentVO> {
  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsOptional()
  @IsString()
  name: string;
}

@Exclude()
export class ComponentDetailVO extends ObjectConstructor<ComponentDetailVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  desp: string;

  @Expose()
  @IsString()
  entry: string;

  @Expose()
  @IsString()
  pkg: string;

  @Expose()
  @IsString()
  preview: string;

  @Expose()
  @IsInt()
  size: number;

  @Expose()
  @IsInt()
  classifyId: number;
}

@Exclude()
export class ComponentClassifyDetailVO extends ObjectConstructor<ComponentClassifyDetailVO> {
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
