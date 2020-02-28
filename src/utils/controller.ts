import { Request } from 'express';

import { HttpError } from 'middlewares/errors';

import { isAllowed, PName, PLvl } from 'data/permission';

// Class
class Controller {
  // Attributes
  private readonly permission?: PName;

  // Constructor
  constructor(permission?: PName) {
    this.permission = permission;
  }

  // Methods
  protected isAllowed(req: Request, level: PLvl) {
    if (!this.permission) return;
    if (!req.holder || !isAllowed(req.holder, this.permission, level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  }
}

export default Controller;
