import { ErrorRequestHandler } from 'express';

import { WritableStream } from 'utils/types';

import { HttpError } from './errors.model';

// Middleware
export const errorHandler = (logger?: WritableStream): ErrorRequestHandler => {
  return (err, req, res, next): void => {
    if (err instanceof HttpError) {
      err.send(res);

      return;
    }

    if (err instanceof Error) {
      if (logger) {
        logger.write(err.stack || `${err.name}: ${err.message}`);
      } else {
        console.log(err);
      }

      HttpError.ServerError(err.message).send(res);

      return;
    }

    next(err);
  };
}
