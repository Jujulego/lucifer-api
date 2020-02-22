import { Request } from 'express';

import { HttpError } from 'middlewares/errors';

import {
  isAllowed,
  PermissionHolder, PermissionName, PermissionLevel as Lvl
} from 'data/permission';

// Types
export interface PermissionUpdate {
  name: PermissionName, level: number
}

// Controller
const Permissions = {
  // Utils
  isAllowed(req: Request, level: Lvl) {
    if (!isAllowed(req.user, "permissions", level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  },

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
  },

  async revoke<T extends PermissionHolder>(req: Request, holder: T, revoke: PermissionUpdate): Promise<T> {
    this.isAllowed(req, Lvl.UPDATE);

    // Apply revoke
    let perm = holder.permissions.find(p => p.name === revoke.name);

    if (perm) {
      // Update level
      perm.level = perm.level ^ (perm.level & revoke.level);

      // Remove object if level is None
      if (perm.level === Lvl.NONE) perm.remove();
    }

    return await holder.save();
  },
};

export default Permissions;