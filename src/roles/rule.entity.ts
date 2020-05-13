import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils';

import { Role } from './role.entity';
import { Rights } from './rights.model';

// Interface
export interface IRule extends Rights {
  id: string;
  resource: string;
  target: string;
  children?: IRule[];
}

// Entity
@Entity()
@Index(['role', 'parent', 'resource', 'target'], { unique: true })
export class Rule implements Rights {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  @Column('varchar', { length: 128 })
  @json() resource: string;

  @Column('uuid', { nullable: true })
  @json() target: string;

  // - default rights
  @Column('boolean', { default: false }) @json() create: boolean;
  @Column('boolean', { default: false }) @json() read:   boolean;
  @Column('boolean', { default: false }) @json() write:  boolean;
  @Column('boolean', { default: false }) @json() delete: boolean;

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
