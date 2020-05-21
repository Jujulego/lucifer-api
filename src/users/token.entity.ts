import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils/json';

import { Resource } from 'resources/resource.model';

import { IUser, User } from './user.entity';
import { LRN } from 'resources/lrn.model';

// Interface
export interface IToken {
  id: string;
  user?: IUser;
  date: Date;
  origin: string;
  tags: string[];
}

// Entity
@Entity()
export class Token implements Resource {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  // - relations
  @ManyToOne(type => User, user => user.tokens, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  @json() user?: User;

  @Column({ nullable: false })
  userId: string;

  // - metadata
  @CreateDateColumn()
  @json() date: Date;

  @Column('inet', { nullable: true })
  @json() ip?: string;

  @Column('varchar', { array: true })
  @json() tags: string[];

  // Methods
  toJSON(): IToken {
    return toJSON(this);
  }

  // Properties
  @json<LRN>(lrn => lrn.toString())
  get lrn() {
    return new LRN('token', this.id, { resource: 'user', id: this.userId });
  }
}
