import { Entity, PrimaryColumn } from 'typeorm';

import { json, toJSON } from 'utils';

// Model
export interface ILocalUser {
  id: string;
}

// Entity
@Entity()
export class LocalUser {
  // Columns
  @PrimaryColumn()
  @json() id: string;

  // Methods
  toJSON(): ILocalUser {
    return toJSON<ILocalUser>(this);
  }
}
