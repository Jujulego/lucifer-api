import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from './user.entity';

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
  @Column('inet') ip: string;
  @Column('varchar', { array: true, length: 64 }) tags: string[];
}
