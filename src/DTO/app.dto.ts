import { Exclude, Expose } from 'class-transformer';
import { IsDate, IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { ObjectConstructor } from '../util/Constructor';
import { AppsCreateVO, AppsModifyVO } from '../VO/app.vo';

@Exclude()
export class AppDTO extends ObjectConstructor<AppDTO> {}

@Exclude()
export class AppCreateDTO extends AppsCreateVO {}

@Exclude()
export class AppModifyDTO extends AppsModifyVO {}

@Exclude()
export class AppDetailDTO extends ObjectConstructor<AppDetailDTO> {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  appName: string;

  @Expose()
  @IsString()
  type: string;

  @Expose()
  @IsOptional()
  @IsInt()
  classify: number;

  @Expose()
  @IsString()
  config: string;
}
