import bcrypt from 'bcryptjs';
import {
  AfterInsert,
  AfterLoad, AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';

import { json, toJSON } from 'utils/json';
import { LRN } from 'bases/lrn';
import { Resource } from 'bases/resource';
import { lowercase } from 'utils/transformers';

import { Daemon, IDaemon } from 'daemons/daemon.entity';

import { IToken, Token } from './token.entity';

// Interface
export interface IUser {
  id: string;
  lrn: string;
  email: string;
  daemons?: IDaemon[];
  tokens?: IToken[];
}

// Methods
@Entity()
export class User implements Resource {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  @Column('varchar', { length: 128, unique: true, transformer: [lowercase] })
  @json() email: string;

  @Column('varchar', { length: 128 })
  password: string;

  // - relations
  @OneToMany(type => Daemon, daemon => daemon.owner)
  @json() daemons?: Daemon[];

  @OneToMany(type => Token, token => token.user)
  @json() tokens?: Token[];

  // Attributes
  private _password: string;

  // Listeners
  @AfterLoad()
  @AfterInsert()
  @AfterUpdate()
  keepPassword() {
    this._password = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password !== this._password) {
      this.password = await bcrypt.hash(this.password, await bcrypt.genSalt());
      this._password = this.password;
    }
  }

  // Methods
  toJSON(): IUser {
    return toJSON(this);
  }

  // Properties
  @json<LRN>({ transform: lrn => lrn.toString() })
  get lrn() {
    return new LRN('users', this.id);
  }
}
