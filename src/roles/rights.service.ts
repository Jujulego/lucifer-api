import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { LRN } from 'resources/lrn.model';

import { Rights } from './rights.model';
import { RoleService } from './role.service';
import { Rule } from './rule.entity';

// Service
@Service({ singleton: true })
export class RightsService {
  // Constructor
  constructor(
    private roles: RoleService
  ) {}

  // Methods
  private static pickRights<T extends Rights>(obj: T): Rights {
    return {
      create: obj.create,
      read: obj.read,
      write: obj.write,
      delete: obj.delete
    };
  }

  async rights(id: string, lrn?: LRN): Promise<Rights> {
    // Get role rights
    const role = await this.roles.get(id);
    let rights = RightsService.pickRights(role);

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
        rights = RightsService.pickRights(rule);
        rules = rule.children;
      } else {
        break;
      }
    }

    return rights;
  }

  async allowed(role: string, lrn: LRN, need: Partial<Rights>): Promise<boolean> {
    // Get role's rights on resource
    const rights = await this.rights(role, lrn);

    // Match rights with needs
    let allowed = true;
    if (need.create) allowed = rights.create;
    if (need.read)   allowed = allowed && rights.read;
    if (need.write)  allowed = allowed && rights.write;
    if (need.delete) allowed = allowed && rights.delete;

    return allowed;
  }

  async allow(role: string, lrn: LRN, need: Partial<Rights>) {
    const allowed = await this.allowed(role, lrn, need);
    if (!allowed) throw HttpError.Forbidden();
  }
}
