import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { HttpError } from 'utils/errors';
import { Token } from 'users/token.entity';

// Middleware
export function auth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false },
    (err, token) => {
      if (err) return next(err);
      if (!token) return next(HttpError.Unauthorized());

      req.token = token;
      req.user = token.user;
      next();
    }
  )(req, res, next);
}

// Add token to Request
declare global {
  namespace Express {
    // noinspection JSUnusedGlobalSymbols
    interface Request {
      token: Token
    }
  }
}