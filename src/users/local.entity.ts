import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Daemon } from 'daemons/daemon.entity';

// Entity
@Entity()
export class LocalUser {
  // Columns
  @PrimaryColumn()
  id: string;

  // - relations
  @OneToMany(type => Daemon, daemon => daemon.owner)
  daemons: Daemon[];
}
