import { Router } from 'express';

import errors, { HttpError } from 'middlewares/errors';
import auth from './auth';
import users from './users';

// Router
const router = Router();

// Routes
router.use(auth);
router.use(users);
router.use((req) => { throw HttpError.NotFound(`Resource not found: ${req.url}`)});

// Errors
router.use(errors());

export default router;
