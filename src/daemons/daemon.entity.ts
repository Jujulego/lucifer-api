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
import { Exclude } from 'class-transformer';

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
  @OneToOne(type => DaemonConfig, config => config.daemon, { nullable: true })
  config: DaemonConfig | null;

  @ManyToOne(type => LocalUser, user => user.daemons, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  @Exclude() owner?: LocalUser;

  @Column({ name: 'ownerId', nullable: true })
  ownerId?: string;

  @ManyToMany(type => Daemon, daemon => daemon.dependents)
  @JoinTable({
    name: 'daemon_dependencies',
    joinColumn: { name: 'dependent' },
    inverseJoinColumn: { name: 'dependency' }
  })
  dependencies: Daemon[]

  @ManyToMany(type => Daemon, daemon => daemon.dependencies)
  dependents: Daemon[]
}
