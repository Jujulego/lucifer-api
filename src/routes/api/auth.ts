import { Router } from 'express';
import validator from 'validator';

import Users from 'controllers/users';
import required from 'middlewares/required';
import { aroute } from 'utils';

// Router
const router = Router();

// Routes
router.post('/login',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.login(req, req.body));
  })
);

export default router;