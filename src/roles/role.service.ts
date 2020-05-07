import { HttpError } from 'errors/errors.model';
import { Service } from 'utils';

import { DatabaseService } from 'db.service';

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
    const role = await this.roles.findOne(id, {
      relations: ['rules', 'rules.parent']
    });

    // Throw if not found
    if (!role) throw HttpError.NotFound(`Role ${id} not found`);

    return this.ruleTree(role);
  }

  async list(): Promise<Role[]> {
    return await this.roles.find();
  }

  // Properties
  get roles() {
    return this.database.connection.getRepository(Role);
  }

  get rules() {
    return this.database.connection.getRepository(Rule);
  }
}
