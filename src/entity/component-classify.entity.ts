import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class ComponentClassify extends Base<ComponentClassify> {
  @Column({ type: 'varchar', length: 64 })
  classifyName: string;

  @Column('int')
  parentId: number;

  @Column({ type: 'int' })
  level: number;
}
