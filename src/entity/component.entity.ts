import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class Component extends Base<Component> {
  @Column({ type: 'int' })
  classifyId: number;

  @Column({ type: 'varchar', length: 128 })
  packageDesp: string;

  @Column({ type: 'varchar', length: 128 })
  packageName: string;

  @Column({ type: 'varchar', length: 32 })
  packageVersion: string;

  @Column({ type: 'varchar', length: 128 })
  packageEntry: string;

  @Column({ type: 'varchar', length: 255 })
  packagePath: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  previewName: string;

  @Column('int')
  size: number;
}
