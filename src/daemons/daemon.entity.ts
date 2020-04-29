import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from 'bases/resource';
import { LRN } from 'bases/lrn';

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
  @PrimaryGeneratedColumn('uuid') id: string;

  // - relations
  @ManyToOne(type => User, user => user.daemons, { onDelete: 'SET NULL' })
  owner?: User;

  // Methods
  toJSON(): IDaemon {
    const obj: IDaemon = {
      id: this.id,
      lrn: this.lrn.toString()
    }

    if (this.owner) {
      obj.owner = this.owner.toJSON();
    }

    return obj;
  }

  // Properties
  get lrn() {
    return new LRN('daemons', this.id);
  }
}
