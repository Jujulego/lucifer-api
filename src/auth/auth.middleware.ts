import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { env } from 'env';
import { HttpError } from 'utils/errors';
import { Token } from 'users/token.entity';

// Strategies
import './auth0.strategy';
import './jwt.strategy';

// Middleware
export function auth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate(env.AUTH_STRATEGY, { session: false },
    (err, token) => {
      if (err) return next(err);
      if (!token) return next(HttpError.Unauthorized());

      req.token = token;
      // req.user = token.user;
      next();
    }
  )(req, res, next);
}

// Add token to Request
declare global {
  namespace Express { // eslint-disable-line @typescript-eslint/no-namespace
    // noinspection JSUnusedGlobalSymbols
    interface Request {
      token: Token;
    }
  }
}
