import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';

import { HttpError } from 'utils/errors/errors.model';

// Middleware
export const errorHandler = (): ErrorRequestHandler => (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return err.send(res);
  }

  if (err instanceof Error) {
    console.error(err.stack);
    return HttpError.ServerError(err.message).send(res);
  }

  next(err);
};
