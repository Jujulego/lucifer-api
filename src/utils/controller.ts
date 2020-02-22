import { Request } from 'express';

import { HttpError } from 'middlewares/errors';

import { isAllowed, PermissionName, PermissionLevel as Lvl } from 'data/permission';

// Class
class Controller {
  // Attributes
  private readonly permission: PermissionName;

  // Constructor
  constructor(permission: PermissionName) {
    this.permission = permission;
  }

  // Methods
  protected isAllowed(req: Request, level: Lvl) {
    if (!isAllowed(req.user, this.permission, level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  }
}

export default Controller;
export { Lvl };