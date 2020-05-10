import { Router } from 'express';

import { aroute, version } from 'utils';
import { errorHandler, HttpError } from 'utils/errors';

import { router as auth } from 'auth/auth.router';
import { router as daemons } from 'daemons/daemon.router';
import { router as users } from 'users/user.router';

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
router.use(errorHandler());
