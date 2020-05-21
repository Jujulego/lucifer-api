import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from 'resources/resource.model';
import { LRN } from 'resources/lrn.model';
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
  toJSON(): IDaemon { return toJSON<IDaemon>(this) }

  // Properties
  @json((val: LRN) => val.toString())
  get lrn(): LRN {
    return new LRN('daemon', this.id);
  }
}
