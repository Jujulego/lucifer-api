import { Router } from 'express';
import validator from 'validator';

import auth from 'middlewares/auth';
import { required, checkParam } from 'middlewares/required';

import { isPName } from 'data/permission';
import Daemons from 'controllers/daemons';

import { fromRequest } from 'bases/context';
import { aroute, parseLevel } from 'utils';

// Router
const router = Router();

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
  aroute(async (req, res) => {
    res.send(await Daemons.find(fromRequest(req)));
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
