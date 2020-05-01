import { Router } from 'express';

import { HttpError } from 'errors/errors.model';
import { aroute, version } from 'utils';

import { router as auth } from 'auth/auth.router';
import { router as daemons } from 'daemons/daemon.router';
import { router as users } from 'users/user.router';
import errors from 'errors/errors.middleware';

// Router
export const router = Router();

// Endpoints
router.use(auth);
router.use('/daemons', daemons);
router.use('/users', users);

router.get('/version', aroute(async (req, res) => {
  res.send(await version());
}));

router.use((req, res, next) => {
  next(HttpError.NotFound());
});

// Errors
router.use(errors());
