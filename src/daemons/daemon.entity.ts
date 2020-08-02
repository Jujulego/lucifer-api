import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { LocalUser } from 'users/local.entity';

// Entity
@Entity()
export class Daemon {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100, nullable: true })
  name: string | null;

  // - relations
  @ManyToOne(() => LocalUser, user => user.daemons, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'ownerId' })
  owner?: LocalUser;
}
