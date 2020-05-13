import { SelectQueryBuilder } from 'typeorm';

import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { LRN } from 'resources/lrn.model';

import { Role } from './role.entity';
import { Rule } from './rule.entity';

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
      qb.where(`parent.target = :target${n}`, { [`target${n}`]: lrn.id });
    } else {
      // Get only roots
      qb.where('"parentId" IS NULL');
      qb.andWhere('"roleId" = :role', { role: id });
    }

    // Resource filter
    qb.andWhere(`rule.resource = :resource${n}`, { [`resource${n}`]: resource });

    return qb;
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Role);
  }

  get rules() {
    return this.database.connection.getRepository(Rule);
  }
}
