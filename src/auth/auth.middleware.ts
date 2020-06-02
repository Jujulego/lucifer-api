import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { env } from 'env';
import { HttpError } from 'utils/errors';
import { Token } from './token.model'; // eslint-disable-line @typescript-eslint/no-unused-vars

// Strategies
import(`./${env.AUTH_STRATEGY}.strategy`);

// Middleware
export function auth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate(env.AUTH_STRATEGY, { session: false },
    (err, token) => {
      if (err) return next(err);
      if (!token) return next(HttpError.Unauthorized());

      req.token = token;
      next();
    }
  )(req, res, next);
}

// Add token to Request
declare global {
  namespace Express { // eslint-disable-line @typescript-eslint/no-namespace
    // noinspection JSUnusedGlobalSymbols
    interface Request {
      token?: Token;
    }
  }
}
