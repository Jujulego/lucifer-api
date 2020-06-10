import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Type } from 'class-transformer';

import { LocalUser } from 'users/local.entity';

import { DaemonConfig } from './config.entity';

// Entity
@Entity()
export class Daemon {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: true })
  name: string | null;

  // - relations
  @OneToOne(() => DaemonConfig, config => config.daemon)
  config?: DaemonConfig;

  @ManyToOne(() => LocalUser, user => user.daemons, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ownerId' })
  @Type(() => LocalUser)
  owner?: LocalUser;

  @ManyToMany(() => Daemon, daemon => daemon.dependents)
  @JoinTable({
    name: 'daemon_dependencies',
    joinColumn: { name: 'dependent' },
    inverseJoinColumn: { name: 'dependency' }
  })
  dependencies: Daemon[]

  @ManyToMany(() => Daemon, daemon => daemon.dependencies)
  dependents: Daemon[]
}
