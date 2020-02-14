import { Router } from 'express';
import validator from 'validator';

import Users from 'controllers/users';
import auth from 'middlewares/auth';
import required from 'middlewares/required';
import { aroute } from 'utils';

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
    res.send(await Users.login(req, req.body));
  })
);

router.delete('/logout', auth,
  aroute(async (req, res) => {
    await Users.logout(req);
    res.send();
  })
);

export default router;