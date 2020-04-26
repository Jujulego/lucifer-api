import { Router } from 'express';

import { DIContainer } from 'inversify.config';
import { aroute } from 'utils';

import { UserService } from 'users/user.service';
import { required } from 'middlewares/required';

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
    res.send(await users.login(email, password));
  })
);
