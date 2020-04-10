import { Router } from 'express';
import validator from 'validator';

import { fromRequest } from 'bases/context';
import DIContainer from 'inversify.config';

import auth from 'middlewares/auth';
import { required, check, checkParam } from 'middlewares/required';

import { UserFilter } from 'data/user/user';
import { isPName } from 'data/permission/permission.enums';

import UsersService from 'services/users.service';

import { aroute, query2filter, parseLevel } from 'utils';

// Router
const router = Router();

// Middlewares
router.use(auth);

// Parameters
router.param('id', checkParam(validator.isMongoId));

// Routes
// - create user
router.post('/',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.create(fromRequest(req), {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

// - create user token
router.post('/:id/token',
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.createToken(fromRequest(req), req.params.id, req.body.tags));
  })
);

// - get user
router.get('/:id',
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.get(fromRequest(req), req.params.id));
  })
);

// - find users
router.get('/',
  check({ query: { email: validator.isEmail } }),
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    const filter = query2filter<keyof UserFilter>(req.query, ['email']);
    res.send(await Users.find(fromRequest(req), filter));
  })
);

// - update user
router.put('/:id',
  check({ body: { email: validator.isEmail }}),
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.update(fromRequest(req), req.params.id, req.body));
  })
);

// - grant user
router.put('/:id/grant',
  required({ body: { name: isPName, level: true }}),
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.grant(fromRequest(req), req.params.id, req.body.name, parseLevel(req.body.level)));
  })
);

// - elevate user
router.put('/:id/elevate',
  check({ body: { admin: validator.isBoolean }}),
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.elevate(fromRequest(req), req.params.id, req.body.admin));
  })
);

// - revoke user
router.put('/:id/revoke',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.revoke(fromRequest(req), req.params.id, req.body.name));
  })
);

// - delete user token
router.delete('/:id/token/:token',
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.deleteToken(fromRequest(req), req.params.id, req.params.token));
  })
);

// - delete user
router.delete('/:id',
  aroute(async (req, res) => {
    // Containers
    const Users = DIContainer.get(UsersService);

    res.send(await Users.delete(fromRequest(req), req.params.id));
  })
);

export default router;
