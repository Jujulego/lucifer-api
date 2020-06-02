import {
  Entity,
  OneToMany, PrimaryColumn
} from 'typeorm';

import { json, toJSON } from 'utils';

import { Daemon, IDaemon } from 'daemons/daemon.entity';

// Interface
export interface IUser {
  id: string;
  daemons?: IDaemon[];
}

// Methods
@Entity()
export class User {
  // Columns
  @PrimaryColumn('varchar', { length: 128 })
  @json() id: string;

  // - relations
  @OneToMany(type => Daemon, daemon => daemon.owner)
  @json() daemons: Daemon[];

  // Methods
  toJSON(): IUser {
    return toJSON<IUser>(this);
  }
}
