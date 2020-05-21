import { RequestParamHandler } from 'express';

import { HTTP_ERRORS, HttpError } from './errors';
import { Validator } from './types';

// Types
export interface CheckOption {
  error: {
    status: keyof typeof HTTP_ERRORS;
    message?: string;
  };
}

// Defaults
const defaults: CheckOption = {
  error: {
    status: 404,
    message: HTTP_ERRORS[404]
  }
}

// Utils
export function check(validator: Validator<string>, opts: CheckOption = defaults): RequestParamHandler {
  // Options
  const { error } = opts;

  // Middleware
  return (req, res, next, value): void => {
    if (!validator(value)) {
      return next(new HttpError(error.status, error.message || HTTP_ERRORS[error.status]));
    }

    next();
  }
}
