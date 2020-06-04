import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils';

import { LocalUser } from 'users/local.entity';

// Interface
export interface IDaemon {
  id: string;
  ownerId?: string;
}

// Entity
@Entity()
export class Daemon {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  // - relations
  @ManyToOne(type => LocalUser, user => user.daemons, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  owner?: LocalUser;

  @Column({ name: 'ownerId', nullable: true })
  @json() ownerId?: string;

  // Methods
  toJSON(): IDaemon { return toJSON<IDaemon>(this) }
}
