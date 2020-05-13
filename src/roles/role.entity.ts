import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils';

import { Resource } from 'resources/resource.model';
import { LRN } from 'resources/lrn.model';

import { Rights } from './rights.model';
import { IRule, Rule } from './rule.entity';

// Interface
export interface IRole extends Rights {
  id: string;
  lrn: string;
  rules?: IRule[];
}

// Entity
@Entity()
export class Role implements Resource, Rights {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  @Column('varchar', { nullable: true, length: 128 })
  @json() name: string;

  // - default rights
  @Column('boolean', { default: false }) @json() create: boolean;
  @Column('boolean', { default: false }) @json() read:   boolean;
  @Column('boolean', { default: false }) @json() write:  boolean;
  @Column('boolean', { default: false }) @json() delete: boolean;

  // - relations
  @OneToMany(type => Rule, rule => rule.role)
  @json() rules: Rule[];

  // Methods
  toJSON() {
    return toJSON<IRole>(this);
  }

  // Properties
  @json<LRN>(lrn => lrn.toString())
  get lrn() {
    return new LRN('role', this.id);
  }
}
