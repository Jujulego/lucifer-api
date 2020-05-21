import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { HttpError } from 'utils/errors';

// Middleware
export function auth(req: Request, res: Response, next: NextFunction): void {
  passport.authenticate('jwt', { session: false },
    (err, user) => {
      if (err) return next(err);
      if (!user) return next(HttpError.Unauthorized());

      req.user = user;
      next();
    }
  )(req, res, next);
}
