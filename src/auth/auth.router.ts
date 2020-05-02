import { Router } from 'express';
import validator from 'validator';

import { DIContainer } from 'inversify.config';
import { aroute } from 'utils';

import { HttpError } from 'errors/errors.model';
import { UserService } from 'users/user.service';

import './jwt.strategy';

// Router
export const router = Router();

// Endpoints
router.post('/login', aroute(async (req, res) => {
    const users = DIContainer.get(UserService);

    // Parse request
    const { email, password } = req.body;
    if (!validator.isEmail(email)) throw HttpError.Unauthorized();

    // Login
    res.send({
      token: await users.login(email, password)
    });
  })
);
