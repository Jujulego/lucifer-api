import { HttpError } from 'middlewares/errors';

import { isAllowed, PName, PLvl } from 'data/permission';

import Context from './context';

// Class
class Controller {
  // Attributes
  private readonly permission?: PName;

  // Constructor
  constructor(permission?: PName) {
    this.permission = permission;
  }

  // Methods
  protected isAllowed(ctx: Context, level: PLvl) {
    if (!this.permission) return;
    if (!ctx.permissions || !isAllowed(ctx.permissions, this.permission, level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  }
}

export default Controller;
