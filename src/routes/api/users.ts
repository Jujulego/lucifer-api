import { Router } from 'express';
import validator from 'validator';

import auth from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';
import required, { check } from 'middlewares/required';

import { UserFilter } from 'data/user';
import { PLvl, isPName, LEVELS } from 'data/permission';
import Users from 'controllers/users';

import { fromRequest } from 'bases/context';
import { aroute, query2filter } from 'utils';

// Router
const router = Router();

// Utils
function isPLvl(str: string): str is keyof typeof PLvl {
  return LEVELS.find(name => name === str) != undefined;
}

function parseLevel(level: string | number): PLvl {
  if (typeof level === 'number') return level & PLvl.ALL;
  if (validator.isNumeric(level)) return parseInt(level) & PLvl.ALL;

  // Compute level
  const parts = level.split(',').filter(isPLvl);
  if (parts.length === 0) throw HttpError.BadRequest("Need at least 1 valid level");

  return parts.reduce<PLvl>(
    (lvl, name) => lvl | PLvl[name],
    PLvl.NONE
  );
}

// Middlewares
router.use(auth);

// Parameters
router.param('id', check(validator.isMongoId));

// Routes
// - create user
router.post('/user/',
  required({ body: { email: validator.isEmail, password: true }}),
  aroute(async (req, res) => {
    res.send(await Users.create(fromRequest(req), {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

// - create user token
router.post('/user/:id/token',
  aroute(async (req, res) => {
    res.send(await Users.createToken(fromRequest(req), req.params.id, req.body.tags));
  })
);

// - get user
router.get('/user/:id',
  aroute(async (req, res) => {
    res.send(await Users.get(fromRequest(req), req.params.id));
  })
);

// - find users
router.get('/users/',
  required({ query: { email: { required: false, validator: validator.isEmail } } }),
  aroute(async (req, res) => {
    const filter = query2filter<keyof UserFilter>(req.query, ['email']);

    res.send(await Users.find(fromRequest(req), filter));
  })
);

// - update user
router.put('/user/:id',
  aroute(async (req, res) => {
    res.send(await Users.update(fromRequest(req), req.params.id, req.body));
  })
);

// - grant user
router.put('/user/:id/grant',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    res.send(await Users.grant(fromRequest(req), req.params.id, {
      name: req.body.name,
      level: parseLevel(req.body.level)
    }));
  })
);

// - elevate user
router.put('/user/:id/elevate',
  required({ body: { admin: { required: false, validator: validator.isBoolean }}}),
  aroute(async (req, res) => {
    res.send(await Users.elevate(fromRequest(req), req.params.id, req.body.admin));
  })
);

// - revoke user
router.put('/user/:id/revoke',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    res.send(await Users.revoke(fromRequest(req), req.params.id, req.body.name));
  })
);

// - delete user token
router.delete('/user/:id/token/:token',
  aroute(async (req, res) => {
    res.send(await Users.deleteToken(fromRequest(req), req.params.id, req.params.token));
  })
);

// - delete user
router.delete('/user/:id',
  aroute(async (req, res) => {
    res.send(await Users.delete(fromRequest(req), req.params.id));
  })
);

export default router;
