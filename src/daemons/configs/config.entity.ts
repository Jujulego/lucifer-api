import { PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

// Types
export type DaemonConfigType = 'docker';

// Entity
export abstract class DaemonConfig {
  // Attributes
  abstract readonly type: DaemonConfigType;

  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;
}
