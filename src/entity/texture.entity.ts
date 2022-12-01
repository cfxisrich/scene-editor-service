import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class Texture extends Base<Texture> {
  @Column({ type: 'int' })
  classifyId: number;

  @Column({ type: 'varchar', length: 128 })
  packageName: string;

  @Column({ type: 'varchar', length: 128 })
  resourceName: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  previewName: string;

  @Column({ type: 'varchar', length: 255 })
  packagePath: string;

  @Column('int')
  size: number;

  @Column({ type: 'varchar', length: 12 })
  ext: string;
}
