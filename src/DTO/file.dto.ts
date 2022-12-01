import { Exclude, Expose } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

@Exclude()
export class FileDTO {
  @Expose()
  @IsOptional()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  role: string;

  @Expose()
  @IsString()
  type: string;

  @Expose()
  @IsOptional()
  @IsString()
  url: string;

  constructor(params?: Partial<FileDTO>) {
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}
@Exclude()
export class ClassifyDTO extends FileDTO {
  @Expose()
  @IsString()
  classifyName: string;

  constructor(params?: Partial<ClassifyDTO>) {
    super();
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}

@Exclude()
export class FileDescDTO {
  @Expose()
  @IsBoolean()
  dir: boolean;

  @Expose()
  @IsInt()
  size: number;

  @Expose()
  @IsString()
  ext: string;

  @Expose()
  @IsString()
  url: string;

  @Expose()
  @IsString()
  name: string;

  constructor(params?: Partial<ModelFileDescDTO>) {
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}

@Exclude()
export class ModelFileDescDTO extends FileDescDTO {
  @Expose()
  @IsOptional()
  @IsString()
  model: string;

  @Expose()
  @IsOptional()
  @IsString()
  preview: string;

  constructor(params?: Partial<ModelFileDescDTO>) {
    super();
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}

@Exclude()
export class ComponentFileDescDTO extends FileDescDTO {
  @Expose()
  @IsOptional()
  @IsString()
  component: string;

  @Expose()
  @IsOptional()
  @IsString()
  preview: string;

  @Expose()
  @IsObject()
  packageJSON: object;

  constructor(params?: Partial<ComponentFileDescDTO>) {
    super();
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}

@Exclude()
export class UploadFileDTO extends FileDTO {
  @Expose()
  @IsString()
  uploadPath: string;

  @Expose()
  @IsString()
  originalname: string;

  constructor(params?: Partial<UploadFileDTO>) {
    super();
    if (params) {
      Object.keys(params).forEach((key) => {
        this[key] = params[key];
      });
    }
  }
}
