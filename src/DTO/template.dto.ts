import { Exclude } from 'class-transformer';
import {
  AddTemplateVO,
  TemplateClassifyDetailVO,
  TemplateDetailVO,
  TemplateModifyVO,
} from '../VO/template.vo';

@Exclude()
export class AddTemplateDTO extends AddTemplateVO {}

@Exclude()
export class TemplateModifyDTO extends TemplateModifyVO {}

@Exclude()
export class TemplateDetailDTO extends TemplateDetailVO {}

@Exclude()
export class TemplateClassifyDetailDTO extends TemplateClassifyDetailVO {}
