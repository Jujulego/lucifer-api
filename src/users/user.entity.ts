import bcrypt from 'bcryptjs';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from 'bases/resource';
import { LRN } from 'bases/lrn';

import { IToken, Token } from './token.entity';

// Interface
export interface IUser {
  id: string;
  lrn: string;
  email: string;
  tokens?: IToken[];
}

// Methods
@Entity()
export class User implements Resource {
  // Columns
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('varchar', { length: 128, unique: true }) email: string;
  @Column('varchar', { length: 128 }) password: string;

  // Relations
  @OneToMany(type => Token, token => token.user)
  tokens: Token[];

  // Attributes
  private _password: string;

  // Listeners
  @AfterLoad()
  keepPassword() {
    this._password = this.password;
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this._password && this.password !== this._password) {
      this.password = await bcrypt.hash(this.password, await bcrypt.genSalt());
    }
  }

  // Methods
  toJSON(): IUser {
    const obj: IUser = {
      id: this.id,
      lrn: this.lrn.toString(),
      email: this.email,
    };

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
