import { Router } from 'express';

import { DIContainer } from 'inversify.config';
import { aroute } from 'utils';

import { auth } from 'auth/auth.middleware';

import { DaemonService } from './daemon.service';

// Router
export const router = Router();

// Middlewares
router.use(auth);

// Endpoints
router.get('/', aroute(async (req, res) => {
  const daemons = DIContainer.get(DaemonService);

  res.send(await daemons.list());
}));
