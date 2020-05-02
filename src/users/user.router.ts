import { Router } from 'express';
import validator from 'validator';

import { DIContainer } from 'inversify.config';
import { aroute, check } from 'utils';

import { auth } from 'auth/auth.middleware';
import { UserService } from 'users/user.service';

// Router
export const router = Router();

// Middlewares
router.param('id', check(validator.isUUID));
router.use(auth);

// Endpoints
router.get('/', aroute(async (req, res) => {
  const service = DIContainer.get(UserService);

  // Get list
  res.send(await service.list());
}));

router.post('/', aroute(async (req, res) => {
  const service = DIContainer.get(UserService);

  // Create user
  res.send(await service.create(req.body));
}));

router.get('/:id', aroute(async (req, res) => {
  const service = DIContainer.get(UserService);

  // Parse request
  const { id } = req.params;

  // Get user
  res.send(await service.get(id));
}));

router.put('/:id', aroute(async (req, res) => {
  const service = DIContainer.get(UserService);

  // Parse request
  const { id } = req.params;

  // Update user
  res.send(await service.update(id, req.body));
}));

router.delete('/:id', aroute(async (req, res) => {
  const service = DIContainer.get(UserService);

  // Parse request
  const { id } = req.params;

  // Delete user
  res.send(await service.delete(id));
}));
