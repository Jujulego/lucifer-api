import { Router } from 'express';

import { DIContainer } from 'inversify.config';
import { aroute } from 'utils';

import { UserService } from 'users/user.service';
import { required } from 'middlewares/required';

import './jwt.strategy';

// Router
export const router = Router();

// Endpoints
router.post('/login',
  required({ body: ['email', 'password'] }),
  aroute(async (req, res) => {
    const users = DIContainer.get(UserService);

    // Parse request
    const { email, password } = req.body;

    // Login
    res.send({
      token: await users.login(email, password)
    });
  })
);
