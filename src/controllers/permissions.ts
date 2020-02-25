import { Request } from 'express';

import { HttpError } from 'middlewares/errors';

import { PermissionHolder, PName, PLvl } from 'data/permission';
import Controller from 'utils/controller';

// Types
export interface PermissionUpdate {
  name: PName, level: PLvl
}

// Class
class PermissionsController extends Controller {
  // Constructor
  constructor() { super("permissions"); }

  // Methods
  async grant<T extends PermissionHolder>(req: Request, holder: T, grant: PermissionUpdate): Promise<T> {
    this.isAllowed(req, PLvl.UPDATE);

    // Apply grant
    let perm = holder.permissions.find(p => p.name === grant.name);

    if (perm) {
      // Update level
      perm.level = grant.level;
    } else {
      // Add permission
      perm = holder.permissions.create({
        name: grant.name, level: grant.level
      });

      holder.permissions.push(perm);
    }

    return await holder.save();
  }

  async elevate<T extends PermissionHolder>(req: Request, holder: T, admin: boolean = true): Promise<T> {
    if (!req.user.admin) {
      throw HttpError.Forbidden();
    }

    holder.admin = admin;
    return await holder.save();
  }

  async revoke<T extends PermissionHolder>(req: Request, holder: T, revoke: PName): Promise<T> {
    this.isAllowed(req, PLvl.DELETE);

    // Apply revoke
    let perm = holder.permissions.find(p => p.name === revoke);

    if (perm) {
      await perm.remove();
    }

    return await holder.save();
  }
}

// Controller
const Permissions = new PermissionsController();
export default Permissions;