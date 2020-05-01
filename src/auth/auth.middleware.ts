import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { HttpError } from 'errors/errors.model';

// Middleware
export function auth(req: Request, res: Response, next: NextFunction) {
  passport.authenticate('jwt', { session: false },
    (err, user) => {
      if (err) return next(err);
      if (!user) return next(HttpError.Unauthorized());

      req.user = user;
      next();
    }
  )(req, res, next);
}
