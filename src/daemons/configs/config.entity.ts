import { PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

// Entity
export abstract class DaemonConfig {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @VersionColumn()
  version: number;
}
