import { NextFunction, Request, Response } from 'express';

import { aroute } from 'utils';

import Daemon from 'data/daemon';
import Token from 'data/token';
import User from 'data/user';

import Users from 'controllers/users';
import { PermissionHolder } from 'data/permission';

// Add properties to Request
declare global {
  namespace Express {
    interface Request {
      token: Token;
      holder?: PermissionHolder;

      user?: User;
      daemon?: Daemon;
    }
  }
}

export interface DaemonRequest extends Request {
  daemon: Daemon;
  user: undefined;
}
export interface UserRequest extends Request {
  daemon: undefined;
  user: User;
}

// Utils
export function isDaemonRequest(req: Request): req is DaemonRequest {
  return !!req.daemon;
}

export function isUserRequest(req: Request): req is UserRequest {
  return !!req.user;
}

// Middleware
const auth = aroute(async (req: Request, res: Response, next: NextFunction) => {
  // Authenticate user
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const user = await Users.authenticate(token);

  // Store in request
  req.user = user;
  req.holder = user;
  req.token = user.tokens.find(tk => tk.token == token) as Token;

  next();
});

export default auth;
