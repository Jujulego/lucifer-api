import { Router } from 'express';
import validator from 'validator';

import { buildContext } from 'context';
import { DIContainer } from 'inversify.config';
import { aroute } from 'utils';
import { HttpError } from 'utils/errors';

import { UserService } from 'users/user.service';

// Strategies
import './jwt.strategy';

// Router
export const router = Router();

// Endpoints
router.post('/login', aroute(async (req, res) => {
  const ctx = buildContext('express', req);
  const users = DIContainer.get(UserService);

  // Parse request
  const { email, password } = req.body;
  if (!email || !validator.isEmail(email)) throw HttpError.Unauthorized();

  // Login
  res.send({
    token: await users.login(ctx, email, password)
  });
}));

router.delete('/logout', aroute(async (req, res) => {
  const ctx = buildContext('express', req);
  const users = DIContainer.get(UserService);

  // Logout
  await users.logout(ctx);
  res.send();
}));
