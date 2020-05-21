import { ErrorRequestHandler } from 'express';

import { HttpError } from 'utils/errors/errors.model';

// Middleware
export const errorHandler = (): ErrorRequestHandler => (err, req, res, next): void => {
  if (err instanceof HttpError) {
    err.send(res);

    return;
  }

  if (err instanceof Error) {
    console.error(err);
    HttpError.ServerError(err.message).send(res);

    return;
  }

  next(err);
};
