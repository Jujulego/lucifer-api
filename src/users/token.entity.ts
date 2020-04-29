import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils/json';

import { IUser, User } from './user.entity';

// Interface
export interface IToken {
  id: string;
  user?: IUser;
  date: Date;
  tags: string[];
}

// Entity
@Entity()
export class Token {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  // - relations
  @ManyToOne(type => User, user => user.tokens, { nullable: false, onDelete: 'CASCADE' })
  @json() user?: User;

  // - metadata
  @CreateDateColumn()
  @json() date: Date;

  @Column('varchar', { array: true })
  @json() tags: string[];

  // Methods
  toJSON(): IToken {
    return toJSON(this);
  }
}
