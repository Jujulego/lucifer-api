import { Router } from 'express';
import validator from 'validator';

import auth from 'middlewares/auth';
import required, { check } from 'middlewares/required';
import { aroute } from 'utils';

import Users from 'controllers/users';
import { PName, PLvl, isPName, LEVELS } from 'data/permission';

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
    res.send(await Users.create(req, {
      email: req.body.email,
      password: req.body.password
    }));
  })
);

// - delete user token
router.post('/user/:id/token',
  aroute(async (req, res) => {
    res.send(await Users.createToken(req, req.params.id, req.body.tags));
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

// - grant user
router.put('/user/:id/grant',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    res.send(await Users.grant(req, req.params.id, {
      name: req.body.name,
      level: parseLevel(req.body.level)
    }));
  })
);

// - revoke user
router.put('/user/:id/revoke',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    res.send(await Users.revoke(req, req.params.id, req.body.name as PName));
  })
);

// - delete user token
router.delete('/user/:id/token/:token',
  aroute(async (req, res) => {
    res.send(await Users.deleteToken(req, req.params.id, req.params.token));
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