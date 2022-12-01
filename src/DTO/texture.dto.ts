import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { AddClassifyVO, UploadTextureVO } from '../VO/texture.vo';

@Exclude()
export class UploadTextureDTO extends UploadTextureVO {
  @Expose()
  @IsString()
  uploadPath: string;

  @Expose()
  @IsString()
  originalname: string;

  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsString()
  role: string;

  constructor(params?: Partial<UploadTextureDTO>) {
    super(params);
  }
}

@Exclude()
export class AddClassifyDTO extends AddClassifyVO {
  @Expose()
  @IsInt()
  userId: number;

  @Expose()
  @IsString()
  role: string;

  constructor(params?: Partial<AddClassifyDTO>) {
    super(params);
  }
}
