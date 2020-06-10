import { ChildEntity, Column, Entity, JoinColumn, OneToOne, PrimaryColumn, TableInheritance } from 'typeorm';

import { Daemon } from './daemon.entity';

// Entity
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' }})
export class DaemonConfig {
  // Columns
  @OneToOne(() => Daemon, { onDelete: 'CASCADE', nullable: false })
  @PrimaryColumn() @JoinColumn()
  daemon: string;
}

@ChildEntity()
export class DockerConfig extends DaemonConfig {
  // Columns
  @Column()
  image: string;

  @Column('json')
  env: Record<string, string>;
}
