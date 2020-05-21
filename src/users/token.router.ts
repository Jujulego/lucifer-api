import { Router } from 'express';
import validator from 'validator';

import { DIContainer } from 'inversify.config';
import { aroute, check } from 'utils';

import { UserService } from './user.service';
import { TokenService } from './token.service';

// Router
export const router = Router({
  mergeParams: true
});

// Middlewares
router.param('tokenId', check(validator.isUUID));

// Endpoints
router.get('/', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);
  const tokens = DIContainer.get(TokenService);

  // Parse request
  const { userId } = req.params;

  // Get user
  res.send(await tokens.list(
    await users.get(userId, { full: false })
  ));
}));

router.delete('/:tokenId', aroute(async (req, res) => {
  const users = DIContainer.get(UserService);
  const tokens = DIContainer.get(TokenService);

  // Parse request
  const { userId, tokenId } = req.params;

  // Delete token
  await tokens.delete(
    await users.get(userId, { full: false }),
    tokenId
  );

  res.send();
}));
