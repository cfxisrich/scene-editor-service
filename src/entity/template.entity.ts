import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class Template extends Base<Template> {
  @Column('int')
  classifyId: number;

  @Column({ type: 'varchar', length: 64 })
  templateName: string;

  @Column({ type: 'varchar', length: 255 })
  packagePath: string;

  @Column({ type: 'varchar', length: 32 })
  previewName: string;
}
