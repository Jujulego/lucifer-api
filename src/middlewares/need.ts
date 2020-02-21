import { NextFunction, Request, Response } from 'express';

import { isAllowed, PermissionLevel, PermissionName } from 'data/permission';
import { HttpError } from 'middlewares/errors';

// Utils
function getLevel(req: Request, level?: PermissionLevel): PermissionLevel {
  if (level || level == PermissionLevel.NONE) return level;

  // Deduce level from method
  switch (req.method) {
    case 'POST':
      return PermissionLevel.CREATE;

    case 'GET':
    case 'HEAD':
    case 'OPTIONS':
      return PermissionLevel.READ;

    case 'PUT':
    case 'PATCH':
      return PermissionLevel.UPDATE;

    case 'DELETE':
      return PermissionLevel.DELETE;

    default:
      return PermissionLevel.NONE;
  }
}

// Middleware
const need = (name: PermissionName, level?: PermissionLevel) => (req: Request, res: Response, next: NextFunction) => {
  if (isAllowed(req.user, name, getLevel(req, level))) next();
  next(HttpError.Forbidden('Action not allowed'));
};

export default need;