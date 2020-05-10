import { SelectQueryBuilder } from 'typeorm';

import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { LRN } from 'resources/lrn.model';

import { Role } from './role.entity';
import { Rule } from './rule.entity';

// Types
export interface Rights {
  create: boolean,
  read: boolean,
  write: boolean,
  delete: boolean
}

// Service
@Service()
export class RoleService {
  // Constructor
  constructor(
    private database: DatabaseService
  ) {}

  // Methods
  private ruleTree(role: Role): Role {
    const rules: { [id: string]: Rule } = {};
    const roots: Rule[] = [];

    // Store roots
    role.rules.forEach(rule => {
      // Index rules
      rules[rule.id] = rule;
      rule.children = [];

      // Store roots
      if (!rule.parent) {
        roots.push(rule);
      }
    });

    // Build tree
    role.rules.forEach(rule => {
      if (rule.parent) {
        rules[rule.parent.id].children.push(rule);
      }

      delete rule.parent;
    });

    // Keep roots
    role.rules = roots;

    return role;
  }

  private getRights(r: Rule | Role): Rights {
    return {
      create: r.create,
      read: r.read,
      write: r.write,
      delete: r.delete
    };
  }

  async get(id: string): Promise<Role> {
    // Get role
    const role = await this.repository.findOne(id, {
      relations: ['rules', 'rules.parent']
    });

    // Throw if not found
    if (!role) throw HttpError.NotFound(`Role ${id} not found`);

    return this.ruleTree(role);
  }

  async list(): Promise<Role[]> {
    return await this.repository.find();
  }

  rulesQb(qb: SelectQueryBuilder<Rule>, id: string, resource: string, lrn?: LRN, n = 1): SelectQueryBuilder<Rule> {
    qb.select('rule.*');
    qb.from(Rule, 'rule');

    if (lrn) {
      // Get direct children
      qb.innerJoin(qb => this.rulesQb(qb, id, lrn.resource, lrn.parent, n + 1), 'parent', 'rule.parent = parent.id');
      qb.where(`parent.target = :target${n}`, { [`target${n}`]: lrn.id })
    } else {
      // Get only roots
      qb.where('"parentId" IS NULL');
      qb.andWhere('"roleId" = :role', { role: id });
    }

    // Resource filter
    qb.andWhere(`rule.resource = :resource${n}`, { [`resource${n}`]: resource });

    return qb;
  }

  async rights(id: string, lrn?: LRN): Promise<Rights> {
    // Get role rights
    const role = await this.get(id);
    let rights = this.getRights(role);

    // Ask for global rights
    if (!lrn) return rights;

    // Get resources
    const resources = [lrn];
    while (resources[0].parent) {
      resources.unshift(resources[0].parent);
    }

    // Search in rules
    let rules = role.rules;
    for (let res of resources) {
      let rule: Rule | null = null;

      // Search for applicable rule
      for (let r of rules) {
        if (r.resource === res.resource) {
          // Exact rule
          if (r.target === res.id) {
            rule = r;
            break;
          }

          // Global rule
          if (!r.target) {
            rule = r;
          }
        }
      }

      // Apply rule !
      if (rule) {
        rights = this.getRights(rule);
        rules = rule.children;
      } else {
        break;
      }
    }

    return rights;
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Role);
  }

  get rules() {
    return this.database.connection.getRepository(Rule);
  }
}
