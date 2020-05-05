import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils';

import { Role } from './role.entity';

// Interface
export interface IRule {
  id: string;
  resource: string;
  target: string;
  children?: IRule[];
}

// Entity
@Entity()
@Index(['role', 'resource', 'target'], { unique: true })
export class Rule {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  @Column('varchar', { length: 128 })
  @json() resource: string;

  @Column('uuid', { nullable: true })
  @json() target: string;

  // - relations
  @ManyToOne(type => Role, role => role.rules, { onDelete: 'CASCADE' })
  role: Role;

  @ManyToOne(type => Rule, rule => rule.children, { onDelete: 'CASCADE' })
  parent: Rule;

  @OneToMany(type => Rule, rule => rule.parent)
  @json() children: Rule[];

  // Methods
  toJSON() {
    return toJSON<IRule>(this);
  }
}
