import { Column, Entity, OneToOne } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Daemon } from '../daemon.entity';
import { DaemonConfig } from './config.entity';
import { ConfigRegistry } from './registry.entity';

// Entity
@Entity()
export class DockerConfig extends DaemonConfig {
  // Attribute
  readonly type = 'docker';

  // Columns
  @Column({ nullable: true })
  image: string;

  @Column('json', { default: {} })
  env: Record<string, string>;

  // - relations
  @OneToOne(() => ConfigRegistry, reg => reg.docker)
  @Exclude() registry: ConfigRegistry;

  // Properties
  @Exclude()
  get daemon(): Daemon {
    return this.registry?.daemon;
  }
}
