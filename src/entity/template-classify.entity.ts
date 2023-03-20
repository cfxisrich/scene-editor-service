import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class TemplateClassify extends Base<TemplateClassify> {
  @Column({ type: 'varchar', length: 64 })
  classifyName: string;

  @Column('int')
  parentId: number;

  @Column({ type: 'int' })
  level: number;
}
