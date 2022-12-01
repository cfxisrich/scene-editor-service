import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { AddClassifyVO, UploadModelVO } from '../VO/model.vo';

@Exclude()
export class UploadModelDTO extends UploadModelVO {
  @Expose()
  @IsString()
  uploadPath: string;

  @Expose()
  @IsString()
  originalname: string;

  constructor(params?: Partial<UploadModelDTO>) {
    super(params);
  }
}

@Exclude()
export class AddClassifyDTO extends AddClassifyVO {}
