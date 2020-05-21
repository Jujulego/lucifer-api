import { Response } from 'express';

import { json, toJSON } from 'utils/json';

import { HTTP_ERRORS } from './errors.constants';

// Interface
export interface IHttpError {
  error: string;
  message: string;
  status: number;
}

// Class
export class HttpError implements Error {
  // Attributes
  @json('error') readonly name: string;
  @json() readonly message: string;
  @json() readonly status: number;

  // Constructor
  constructor(status: keyof typeof HTTP_ERRORS, message: string) {
    this.name = HTTP_ERRORS[status];
    this.message = message;
    this.status = status;
  }

  // Statics
  static BadRequest(  msg: string = HTTP_ERRORS[400]): HttpError { return new HttpError(400, msg); }
  static Unauthorized(msg: string = HTTP_ERRORS[401]): HttpError { return new HttpError(401, msg); }
  static Forbidden(   msg: string = HTTP_ERRORS[403]): HttpError { return new HttpError(403, msg); }
  static NotFound(    msg: string = HTTP_ERRORS[404]): HttpError { return new HttpError(404, msg); }
  static ServerError( msg: string = HTTP_ERRORS[500]): HttpError { return new HttpError(500, msg); }

  // Methods
  send(res: Response): Response {
    return res.status(this.status).send(toJSON(this));
  }
}
