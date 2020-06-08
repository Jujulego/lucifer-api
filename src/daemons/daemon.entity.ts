import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { LocalUser } from 'users/local.entity';

// Entity
@Entity()
export class Daemon {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // - relations
  @ManyToOne(type => LocalUser, user => user.daemons, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ownerId' })
  @Exclude() owner?: LocalUser;

  @Column({ name: 'ownerId', nullable: true })
  ownerId?: string;
}
