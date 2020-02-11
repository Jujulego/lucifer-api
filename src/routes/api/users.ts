import { Router } from 'express';
import validator from 'validator';

import Users from 'controllers/users';
import auth from 'middlewares/auth';
import required, { check } from 'middlewares/required';
import { aroute } from 'utils';

// Router
const router = Router();

// Middlewares
router.use(auth);

// Parameters
router.param('id', check(validator.isMongoId));

// Routes
// - create user
router.post('/user/',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.create(req, {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

// - get user
router.get('/user/:id',
  aroute(async (req, res) => {
    res.send(await Users.get(req, req.params.id));
  })
);

// - update user
router.put('/user/:id',
  aroute(async (req, res) => {
    res.send(await Users.update(req, req.params.id, req.body));
  })
);

// - delete user
router.delete('/user/:id',
  aroute(async (req, res) => {
    res.send(await Users.delete(req, req.params.id));
  })
);

// - find user
router.get('/users/',
  aroute(async (req, res) => {
    res.send(await Users.find(req));
  })
);

export default router;