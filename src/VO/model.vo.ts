import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ObjectConstructor } from '../util/Constructor';

@Exclude()
export class UploadModelVO extends ObjectConstructor<UploadModelVO> {
  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsOptional()
  @IsString()
  packageName: string;
}

@Exclude()
export class ModelDetailVO extends ObjectConstructor<ModelDetailVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  model: string;

  @Expose()
  @IsString()
  preview: string;

  @Expose()
  @IsInt()
  size: number;

  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsString()
  ext: string;
}

@Exclude()
export class ModelClassifyDetailVO extends ObjectConstructor<ModelClassifyDetailVO> {
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
export class AddClassifyVO extends ObjectConstructor<AddClassifyVO> {
  @Expose()
  @IsOptional()
  @IsInt()
  parentId: number;

  @Expose()
  @IsString()
  name: string;
}
