import { NextFunction, Request, Response } from 'express';

import { aroute } from 'utils';

import Users from 'controllers/users';
import Token from 'data/token';
import User from 'data/user';

// Add properties to Request
declare global {
  namespace Express {
    interface Request {
      user: User,
      token: Token
    }
  }
}

// Middleware
const auth = aroute(async (req: Request, res: Response, next: NextFunction) => {
  // Authenticate user
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const user = await Users.authenticate(token);

  // Store in request
  req.user = user;
  req.token = user.tokens.find(tk => tk.token == token) as Token;

  next();
});

export default auth;