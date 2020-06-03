import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { json, toJSON } from 'utils';

import { Daemon, IDaemon } from 'daemons/daemon.entity';

// Model
export interface ILocalUser {
  id: string;
  daemons?: IDaemon[];
}

// Entity
@Entity()
export class LocalUser {
  // Columns
  @PrimaryColumn()
  @json() id: string;

  // - relations
  @OneToMany(type => Daemon, daemon => daemon.owner)
  @json() daemons: Daemon[];

  // Methods
  toJSON(): ILocalUser {
    return toJSON<ILocalUser>(this);
  }
}
