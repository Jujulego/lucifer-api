import { Router } from 'express';

import errors, { HttpError } from 'middlewares/errors';
import { aroute, version } from 'utils';

import auth from './auth';
import daemons from './daemons';
import users from './users';

// Router
const router = Router();

// Routes
router.get('/version', aroute(async (req, res) => {
  res.send(await version());
}));

router.use(auth);
router.use('/daemons', daemons);
router.use(users);

router.use((req) => {
  throw HttpError.NotFound(`Resource not found: ${req.url}`);
});

// Errors
router.use(errors());

export default router;
