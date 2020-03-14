import { Router } from 'express';
import gitP from 'simple-git/promise';
import validator from 'validator';

import auth from 'middlewares/auth';
import { required } from 'middlewares/required';

import Users from 'controllers/users';
import Daemons from 'controllers/daemons';
import Tokens from 'controllers/tokens';

import pkg from '../../../package.json';
import { fromRequest } from 'bases/context';
import { aroute } from 'utils';

// Constants
const git = gitP();

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

router.get('/version', aroute(async (req, res) => {
  const commit = await git.revparse(['--short', 'HEAD']);

  res.send({
    version: pkg.version,
    commit
  });
}));

export default router;
