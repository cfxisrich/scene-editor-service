import { Exclude, Expose } from 'class-transformer';
import { IsInt, IsString } from 'class-validator';
import { UploadComponentVO } from '../VO/component.vo';

@Exclude()
export class UploadComponentDTO extends UploadComponentVO {
  @Expose()
  @IsString()
  uploadPath: string;

  @Expose()
  @IsString()
  originalname: string;

  constructor(params?: Partial<UploadComponentDTO>) {
    super(params);
  }
}
