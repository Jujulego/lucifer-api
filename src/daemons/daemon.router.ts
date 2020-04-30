import { Router } from 'express';
import validator from 'validator';

import { DIContainer } from 'inversify.config';
import { checkParam } from 'middlewares/required';
import { aroute } from 'utils';

import { auth } from 'auth/auth.middleware';

import { DaemonService } from './daemon.service';

// Router
export const router = Router();

// Middlewares
router.param('id', checkParam(validator.isUUID))
router.use(auth);

// Endpoints
router.get('/', aroute(async (req, res) => {
  const daemons = DIContainer.get(DaemonService);

  res.send(await daemons.list());
}));

router.post('/', aroute(async (req, res) => {
  const daemons = DIContainer.get(DaemonService);

  res.send(await daemons.create(req.body));
}));

router.get('/:id', aroute(async (req, res) => {
  const daemons = DIContainer.get(DaemonService);

  const { id } = req.params;
  res.send(await daemons.get(id));
}));

router.put('/:id', aroute(async (req, res) => {
  const daemons = DIContainer.get(DaemonService);

  const { id } = req.params;
  res.send(await daemons.update(id, req.body));
}));

router.delete('/:id', aroute(async (req, res) => {
  const daemons = DIContainer.get(DaemonService);

  const { id } = req.params;
  res.send(await daemons.delete(id));
}));
