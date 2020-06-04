import { Router } from 'express';

import { DIContainer } from 'inversify.config';
import { aroute } from 'utils';

import { auth } from 'auth/auth.middleware';

import { UserService } from './user.service';

// Router
export const router = Router();

// Middlewares
router.use(auth);

// Endpoints
router.get('/', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Get list
  res.send(await users.list());
}));

router.get('/:userId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Parse request
  const { userId } = req.params;

  // Get user
  res.send(await users.get(userId));
}));
