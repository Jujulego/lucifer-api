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
  async get(id: string): Promise<Role> {
    // Get role
    const role = await this.roles.findOne(id, {
      relations: ['rules']
    });

    // Throw if not found
    if (!role) throw HttpError.NotFound(`Role ${id} not found`);

    return role;
  }

  // Properties
  get roles() {
    return this.database.connection.getRepository(Role);
  }

  get rules() {
    return this.database.connection.getRepository(Rule);
  }
}
