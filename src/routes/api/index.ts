import { Router } from 'express';

import errors, { HttpError } from 'middlewares/errors';

// Router
const router = Router();

// Routes
router.use((req) => { throw HttpError.NotFound(`Ressource not found: ${req.url}`)});

// Errors
router.use(errors());

export default router;