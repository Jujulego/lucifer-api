import { Request } from 'express';

import Controller, { Lvl } from 'utils/controller';

import { PermissionHolder, PermissionName, PermissionLevel } from 'data/permission';

// Types
export interface PermissionUpdate {
  name: PermissionName, level: PermissionLevel
}

// Class
class PermissionsController extends Controller {
  // Constructor
  constructor() { super("permissions"); }

  // Methods
  async grant<T extends PermissionHolder>(req: Request, holder: T, grant: PermissionUpdate): Promise<T> {
    this.isAllowed(req, Lvl.UPDATE);

    // Apply grant
    let perm = holder.permissions.find(p => p.name === grant.name);

    if (perm) {
      // Update level
      perm.level = perm.level | grant.level;
    } else {
      // Add permission
      perm = holder.permissions.create({
        name: grant.name, level: grant.level
      });

      holder.permissions.push(perm);
    }

    return await holder.save();
  }

  async revoke<T extends PermissionHolder>(req: Request, holder: T, revoke: PermissionUpdate): Promise<T> {
    this.isAllowed(req, Lvl.UPDATE);

    // Apply revoke
    let perm = holder.permissions.find(p => p.name === revoke.name);

    if (perm) {
      // Update level
      perm.level = perm.level ^ (perm.level & revoke.level);

      // Remove object if level is None
      if (perm.level === PermissionLevel.NONE) {
        await perm.remove();
      }
    }

    return await holder.save();
  }
}

// Controller
const Permissions = new PermissionsController();
export default Permissions;