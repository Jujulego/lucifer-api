import {
  Request, Response,
  NextFunction, RequestParamHandler
} from 'express';

import { HttpError } from 'middlewares/errors';

// Types
type Blocks = 'params' | 'query' | 'body';
type Validator = (value: any) => boolean;
type ParameterOptions = { required?: boolean, validator?: Validator };
type Parameters = { [name: string]: boolean | Validator | ParameterOptions };
type Options = { [name: string]: ParameterOptions };

type RequestObject = Request['params'] | Request['query'] | Request['body'];
type RequestOptions = { [block in Blocks]?: Options };

type CheckParameters    = { [block in Blocks]?: Parameters };
type RequiredParameters = { [block in Blocks]?: string[] | Parameters };

type ErrorGenerator = (msg?: string) => HttpError

// Utils
const isStringArray = (obj: string[] | Parameters): obj is string[] => obj instanceof Array;

function toOptions(val: boolean | Validator | ParameterOptions): ParameterOptions {
  if (typeof val === 'boolean') {
    return { required: val };
  }

  if (typeof val === 'function') {
    return { validator: val };
  }

  return val;
}

function checkOptions(params: Parameters): Options {
  return Object.keys(params).reduce<Options>((res, param) => {
    const opt = toOptions(params[param]);
    if (opt.required === undefined) {
      opt.required = false;
    }

    res[param] = opt;

    return res;
  }, {});
}

function requiredOptions(params: string[] | Parameters): Options {
  // String array
  if (isStringArray(params)) {
    return params.reduce<Options>(
      (opts, param) => Object.assign(opts, { [param]: {} }),
      {}
    );
  }

  // Parameters
  return Object.keys(params).reduce<Options>(
    (opts, param) => Object.assign(opts, { [param]: toOptions(params[param]) }),
    {}
  );
}

function error(block: Blocks): ErrorGenerator {
  if (block === 'params') {
    return HttpError.NotFound;
  }

  return HttpError.BadRequest;
}

function test(obj: RequestObject, opts: Options, error: ErrorGenerator): Response | null {
  const missing: string[] = [];

  for (const name of Object.keys(opts)) {
    const { required = true, validator } = opts[name];
    const value = obj[name];

    if (required && value === undefined) {
      missing.push(name);
    } else if (typeof value === "string" && validator && !validator(value)) {
      throw error(`Invalid value for ${name}`);
    }
  }

  if (missing.length > 0) {
    throw error(`Missing required parameters: ${missing.join(', ')}`);
  }

  return null;
}

// Parameter checker
export function checkParam(validator: Validator): RequestParamHandler {
  const err = error('params');

  return (req, res, next, value, name) => {
    if (validator(value)) {
      next();
    } else {
      throw err(`Invalid value for ${name}`);
    }
  }
}

// Middlewares
export function check(parameters: CheckParameters) {
  // Parse options
  const opts: RequestOptions = {};
  if (parameters.params) opts.params = checkOptions(parameters.params);
  if (parameters.query)  opts.query  = checkOptions(parameters.query);
  if (parameters.body)   opts.body   = checkOptions(parameters.body);

  return required(opts);
}

export function required(parameters: RequiredParameters) {
  // Parse options
  const opts: RequestOptions = {};
  if (parameters.params) opts.params = requiredOptions(parameters.params);
  if (parameters.query)  opts.query  = requiredOptions(parameters.query);
  if (parameters.body)   opts.body   = requiredOptions(parameters.body);

  // Middleware
  return function(req: Request, res: Response, next: NextFunction) {
    try {
      let result: Response | null;
      if (opts.params && (result = test(req.params, opts.params, error('params')))) return result;
      if (opts.query  && (result = test(req.query,  opts.query,  error('query'))))  return result;
      if (opts.body   && (result = test(req.body,   opts.body,   error('body'))))   return result;

      next();
    } catch (error) {
      next(error);
    }
  }
}
