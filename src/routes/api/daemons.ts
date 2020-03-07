import { Router } from 'express';
import validator from 'validator';

import auth from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';
import required, { check } from 'middlewares/required';

import { DaemonFilter } from 'data/daemon';
import { PLvl, isPName, LEVELS } from 'data/permission';
import Daemons from 'controllers/daemons';

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
// - create daemon
router.post('/daemon/',
  required({ body: { user: validator.isMongoId } }),
  aroute(async (req, res) => {
    res.send(await Daemons.create(fromRequest(req), {
      name: req.body.name,
      user: req.body.user
    }));
  })
);

// - create daemon token
router.post('/daemon/:id/token',
  aroute(async (req, res) => {
    res.send(await Daemons.createToken(fromRequest(req), req.params.id, req.body.tags));
  })
);

// - get daemon
router.get('/daemon/:id',
  aroute(async (req, res) => {
    res.send(await Daemons.get(fromRequest(req), req.params.id));
  })
);

// - find daemons
router.get('/daemons/',
  required({ query: { user: { required: false, validator: validator.isMongoId } } }),
  aroute(async (req, res) => {
    const filter = query2filter<keyof DaemonFilter>(req.query, ['name', 'user']);

    res.send(await Daemons.find(fromRequest(req), filter));
  })
);

// - update daemon
router.put('/daemon/:id',
  aroute(async (req, res) => {
    res.send(await Daemons.update(fromRequest(req), req.params.id, req.body));
  })
);

// - grant daemon
router.put('/daemon/:id/grant',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    res.send(await Daemons.grant(fromRequest(req), req.params.id, {
      name: req.body.name,
      level: parseLevel(req.body.level)
    }));
  })
);

// - revoke daemon
router.put('/daemon/:id/revoke',
  required({ body: { name: isPName }}),
  aroute(async (req, res) => {
    res.send(await Daemons.revoke(fromRequest(req), req.params.id, req.body.name));
  })
);

// - delete daemon token
router.delete('/daemon/:id/token/:token',
  aroute(async (req, res) => {
    res.send(await Daemons.deleteToken(fromRequest(req), req.params.id, req.params.token));
  })
);

// - delete daemon
router.delete('/daemon/:id',
  aroute(async (req, res) => {
    res.send(await Daemons.delete(fromRequest(req), req.params.id));
  })
);

export default router;
