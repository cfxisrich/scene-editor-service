import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { ObjectConstructor } from '../util/Constructor';

@Exclude()
export class UploadTextureVO extends ObjectConstructor<UploadTextureVO> {
  @Expose()
  @IsInt()
  classifyId: number;

  @Expose()
  @IsOptional()
  @IsString()
  packageName: string;
}

@Exclude()
export class TextureDetailVO extends ObjectConstructor<TextureDetailVO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  texture: string;

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
export class TextureClassifyDetailVO extends ObjectConstructor<TextureClassifyDetailVO> {
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
