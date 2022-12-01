import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { ObjectConstructor } from '../util/Constructor';

@Entity()
export class Base<T extends object> extends ObjectConstructor<T> {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  id: number;

  @Column('boolean')
  delete: boolean;

  @CreateDateColumn()
  createTime: string;

  @UpdateDateColumn()
  modifyTime: string;

  @VersionColumn({ type: 'bigint' })
  version: string;
}
