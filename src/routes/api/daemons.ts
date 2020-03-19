import { Router } from 'express';
import validator from 'validator';

import auth from 'middlewares/auth';
import { required, checkParam, check } from 'middlewares/required';

import { DaemonFilter } from 'data/daemon';
import { isPName } from 'data/permission/permission.enums';
import DaemonsController from 'controllers/daemons';

import { fromRequest } from 'bases/context';
import DIContainer from 'inversify.config';
import { aroute, query2filter, parseLevel } from 'utils';

// Router
const router = Router();

// Containers
const Daemons = DIContainer.get(DaemonsController);

// Middlewares
router.use(auth);

// Parameters
router.param('id', checkParam(validator.isMongoId));

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
  check({ query: { user: validator.isMongoId } }),
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
    res.send(await Daemons.grant(fromRequest(req), req.params.id, req.body.name, parseLevel(req.body.level)));
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
