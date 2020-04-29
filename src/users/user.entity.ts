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
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('varchar', { length: 128, unique: true, transformer: [lowercase] }) email: string;
  @Column('varchar', { length: 128 }) password: string;

  // - relations
  @OneToMany(type => Daemon, daemon => daemon.owner)
  daemons?: Daemon[];

  @OneToMany(type => Token, token => token.user)
  tokens?: Token[];

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
    const obj: IUser = {
      id: this.id,
      lrn: this.lrn.toString(),
      email: this.email,
    };

    if (this.daemons) {
      obj.daemons = this.daemons.map(dmn => dmn.toJSON());
    }

    if (this.tokens) {
      obj.tokens = this.tokens.map(tk => tk.toJSON());
    }

    return obj;
  }

  // Properties
  get lrn() {
    return new LRN('users', this.id);
  }
}
