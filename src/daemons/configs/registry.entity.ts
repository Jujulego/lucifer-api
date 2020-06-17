import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

import { Daemon } from '../daemon.entity';
import { DockerConfig } from './docker.entity';

// Entity
@Entity()
export class ConfigRegistry {
  // Columns
  @PrimaryGeneratedColumn()
  @Exclude() id: number;

  @OneToOne(() => Daemon, dmn => dmn.registry, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn()
  daemon: Daemon;

  @OneToOne(() => DockerConfig, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  docker?: DockerConfig;

  @Column('uuid', { nullable: true })
  dockerId?: string;
}
