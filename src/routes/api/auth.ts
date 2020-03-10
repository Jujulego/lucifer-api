import { Router } from 'express';
import validator from 'validator';

import auth from 'middlewares/auth';
import { required } from 'middlewares/required';

import Users from 'controllers/users';
import Daemons from 'controllers/daemons';
import Tokens from 'controllers/tokens';

import { fromRequest } from 'bases/context';
import { aroute } from 'utils';

// Router
const router = Router();

// Routes
router.post('/signin',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.create(fromRequest(req), {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

router.post('/login',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.login(fromRequest(req), req.body, req.body.tags));
  })
);

router.delete('/logout', auth,
  aroute(async (req, res) => {
    await Tokens.logout(fromRequest(req));

    res.send();
  })
);

export default router;
