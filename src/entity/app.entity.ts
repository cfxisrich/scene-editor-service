import { Column, Entity } from 'typeorm';
import { Base } from './base.entity';

@Entity()
export class App extends Base<App> {
  @Column('int')
  classifyId: number;

  @Column({ type: 'varchar', length: 64 })
  appName: string;

  @Column({ type: 'varchar', length: 255 })
  packagePath: string;

  @Column({ type: 'varchar', length: 32 })
  previewName: string;
}
