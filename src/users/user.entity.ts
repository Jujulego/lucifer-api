import bcrypt from 'bcryptjs';
import {
  AfterInsert,
  AfterLoad, AfterUpdate,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany, PrimaryGeneratedColumn
} from 'typeorm';

import { lowercase, json, toJSON } from 'utils';

import { LRN } from 'resources/lrn.model';
import { Resource } from 'resources/resource.model';
import { Daemon, IDaemon } from 'daemons/daemon.entity';

import { IToken, Token } from './token.entity';
import { UserService } from './user.service';

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
  toJSON() {
    return toJSON<IUser>(this);
  }

  // Properties
  @json<LRN>(lrn => lrn.toString())
  get lrn() {
    return UserService.lrn(this.id);
  }
}
