import { Document } from 'mongoose';

import { HttpError } from 'middlewares/errors';

import { isAllowed, PName, PLvl } from 'data/permission';

import Context from './context';
import { DataEmitter } from './emitter';

// Class
abstract class Controller<T extends Document> extends DataEmitter<T> {
  // Attributes
  private readonly permission?: PName;

  // Constructor
  constructor(permission?: PName) {
    super();
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
