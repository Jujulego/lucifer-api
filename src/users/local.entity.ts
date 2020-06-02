import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils';

// Model
export interface ILocalUser {
  id: string;
  auth0: string;
}

// Entity
@Entity()
export class LocalUser {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  @Column({ unique: true })
  @json() auth0: string;

  // Methods
  toJSON(): ILocalUser {
    return toJSON<ILocalUser>(this);
  }

  // Properties
  get provider(): string {
    return this.auth0.split('|')[0];
  }
}
