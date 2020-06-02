import { Router } from 'express';
import validator from 'validator';

import { DIContainer } from 'inversify.config';
import { aroute, check } from 'utils';

import { auth } from 'auth/auth.middleware';

import { UserService } from './user.service';

// Router
export const router = Router();

// Middlewares
router.param('userId', check(validator.isUUID));
router.use(auth);

// Endpoints
router.get('/', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Get list
  res.send(await users.list());
}));

router.get('/auth0', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Get list
  res.send(await users.alist());
}));

router.get('/:userId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Parse request
  const { userId } = req.params;

  // Get user
  res.send(await users.get(userId));
}));

router.delete('/:userId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Parse request
  const { userId } = req.params;

  // Delete user
  res.send(await users.delete(userId));
}));
