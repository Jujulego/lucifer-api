import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from 'bases/resource';
import { LRN } from 'bases/lrn';
import { json, toJSON } from 'utils';

import { IUser, User } from 'users/user.entity';

// Interface
export interface IDaemon {
  id: string;
  lrn: string;
  owner?: IUser;
}

// Entity
@Entity()
export class Daemon implements Resource {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  // - relations
  @ManyToOne(type => User, user => user.daemons, { onDelete: 'SET NULL' })
  @json() owner?: User;

  // Methods
  toJSON() { return toJSON<IDaemon>(this) }

  // Properties
  @json<LRN>(val => val.toString())
  get lrn() {
    return new LRN('daemons', this.id);
  }
}
