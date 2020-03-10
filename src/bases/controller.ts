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
  protected async isAllowed(ctx: Context, level: PLvl) {
    if (!this.permission) return;
    if (!ctx.permissions || !isAllowed(await ctx.permissions, this.permission, level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  }
}

export default Controller;
