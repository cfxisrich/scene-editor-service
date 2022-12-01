import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class TextureClassify extends Base<TextureClassify> {
  @Column({ type: 'varchar', length: 128 })
  classifyName: string;

  @Column('int')
  parentId: number;

  @Column('int')
  level: number;
}
