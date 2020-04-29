import { Router } from 'express';

import errors, { HttpError } from 'middlewares/errors';
import { aroute, version } from 'utils';

import { router as auth } from 'auth/auth.router';
import { router as users } from 'users/user.router';

// Router
export const router = Router();

// Endpoints
router.use(auth);
router.use('/users', users);

router.get('/version', aroute(async (req, res) => {
  res.send(await version());
}));

router.use((req, res, next) => {
  next(HttpError.NotFound());
});

// Errors
router.use(errors());
