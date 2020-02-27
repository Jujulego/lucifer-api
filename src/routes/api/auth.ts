import { Router } from 'express';
import validator from 'validator';

import Users from 'controllers/users';
import auth, { isDaemonRequest, isUserRequest } from 'middlewares/auth';
import required from 'middlewares/required';
import { aroute } from 'utils';
import Daemons from 'controllers/daemon';

// Router
const router = Router();

// Routes
router.post('/signin',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.create(req, {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

router.post('/login',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.login(req, req.body, req.body.tags));
  })
);

router.delete('/logout', auth,
  aroute(async (req, res) => {
    if (isUserRequest(req)) await Users.logout(req);
    if (isDaemonRequest(req)) await Daemons.logout(req);
    res.send();
  })
);

export default router;
