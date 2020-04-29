import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  @PrimaryGeneratedColumn('uuid') id: string;

  // - relations
  @ManyToOne(type => User, user => user.tokens, { onDelete: 'CASCADE' })
  user: User;

  // - metadata
  @CreateDateColumn() date: Date;
  @Column('varchar', { array: true, length: 64 }) tags: string[];

  // Methods
  toJSON(): IToken {
    const obj: IToken = {
      id: this.id,
      date: this.date,
      tags: this.tags
    };

    if (this.user) {
      obj.user = this.user.toJSON();
    }

    return obj;
  }
}
