import { Router } from 'express';
import validator from 'validator';

import { DIContainer } from 'inversify.config';
import { aroute, check } from 'utils';

import { auth } from 'auth/auth.middleware';

import { UserService } from './user.service';
import { router as tokens } from './token.router';

// Router
export const router = Router();

// Middlewares
router.param('userId', check(validator.isUUID));
router.use(auth);

// Routers
router.use('/:userId/tokens', tokens);

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

router.post('/', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Create user
  res.send(await users.create(req.body));
}));

router.get('/:userId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Parse request
  const { userId } = req.params;

  // Get user
  res.send(await users.get(userId));
}));

router.put('/:userId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Parse request
  const { userId } = req.params;

  // Update user
  res.send(await users.update(userId, req.body));
}));

router.delete('/:userId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);

  // Parse request
  const { userId } = req.params;

  // Delete user
  res.send(await users.delete(userId));
}));
