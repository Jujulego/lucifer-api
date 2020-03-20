import { Router } from 'express';
import validator from 'validator';

import { fromRequest } from 'bases/context';

import auth from 'middlewares/auth';
import { required } from 'middlewares/required';

import UsersService from 'services/users.service';

import TokensService from 'services/tokens.service';

import DIContainer from 'inversify.config';
import { aroute } from 'utils';

// Router
const router = Router();

// Containers
const Tokens = () => DIContainer.get(TokensService);
const Users = () => DIContainer.get(UsersService);

// Routes
router.post('/signin',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users().create(fromRequest(req), {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

router.post('/login',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users().login(fromRequest(req), req.body, req.body.tags));
  })
);

router.delete('/logout', auth,
  aroute(async (req, res) => {
    await Tokens().logout(fromRequest(req));

    res.send();
  })
);

export default router;
