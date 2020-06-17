import { Column, Entity, OneToOne } from 'typeorm';

import { Daemon } from '../daemon.entity';
import { DaemonConfig } from './config.entity';
import { ConfigRegistry } from './registry.entity';

// Entity
@Entity()
export class DockerConfig extends DaemonConfig {
  // Attribute
  readonly type = 'docker';

  // Columns
  @Column()
  image: string;

  @Column('json')
  env: Record<string, string>;

  // - relations
  @OneToOne(() => ConfigRegistry, reg => reg.docker)
  registry: ConfigRegistry;

  // Properties
  get daemon(): Daemon {
    return this.registry?.daemon;
  }
}
