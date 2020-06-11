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

import { LocalUser } from 'users/local.entity';

import { ConfigRegistry } from './configs/registry.entity';

// Entity
@Entity()
export class Daemon {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: true })
  name: string | null;

  // - relations
  @OneToOne(() => ConfigRegistry, reg => reg.daemon)
  registry?: ConfigRegistry;

  @ManyToOne(() => LocalUser, user => user.daemons, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ownerId' })
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
