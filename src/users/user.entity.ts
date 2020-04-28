import bcrypt from 'bcryptjs';
import { omit } from 'lodash';
import { AfterLoad, BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Resource } from 'bases/resource';
import { LRN } from 'bases/lrn';

import { Token } from './token.entity';

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
  toJSON() {
    const obj: any = omit(this, ['password', '_password']);
    obj.lrn = this.lrn.toString();

    return obj;
  }

  // Properties
  get lrn() {
    return new LRN('users', this.id);
  }
}
