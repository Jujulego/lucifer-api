import { Document } from 'mongoose';

import { HttpError } from 'middlewares/errors';

import { isAllowed, PName, PLvl } from 'data/permission';

import Context from './context';
import { DataEmitter } from './data';
import { injectable } from 'inversify';

// Class
@injectable()
abstract class Controller<T extends Document> extends DataEmitter<T> {
  // Attributes
  protected readonly permission?: PName;

  // Methods
  protected async isAllowed(ctx: Context, level: PLvl) {
    if (!this.permission) return;
    if (!ctx.permissions || !isAllowed(await ctx.permissions, this.permission, level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  }
}

export default Controller;
