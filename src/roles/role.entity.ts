import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { json, toJSON } from 'utils';

import { Resource } from 'resources/resource.model';

import { IRule, Rule } from './rule.entity';
import { LRN } from '../resources/lrn.model';

// Interface
export interface IRole {
  id: string;
  lrn: string;
  rules?: IRule[];
}

// Entity
@Entity()
export class Role implements Resource {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  @json() id: string;

  @Column('varchar', { nullable: true, length: 128 })
  @json() name: string;

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
