import { Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Daemon } from 'daemons/daemon.entity';
import { Type } from 'class-transformer';

// Entity
@Entity()
export class LocalUser {
  // Columns
  @PrimaryColumn()
  id: string;

  // - relations
  @OneToMany(() => Daemon, daemon => daemon.owner)
  @Type(() => Daemon)
  daemons?: Daemon[];
}
