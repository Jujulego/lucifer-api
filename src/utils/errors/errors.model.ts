import { Response } from 'express';
import { HTTP_ERRORS } from 'utils/errors/errors.constants';

// Class
export class HttpError implements Error {
  // Attributes
  readonly name: string;
  readonly message: string;
  readonly status: number;

  // Constructor
  constructor(status: keyof typeof HTTP_ERRORS, message: string) {
    this.name = HTTP_ERRORS[status];
    this.message = message;
    this.status = status;
  }

  // Statics
  static BadRequest(  msg: string = HTTP_ERRORS[400]) { return new HttpError(400, msg); }
  static Unauthorized(msg: string = HTTP_ERRORS[401]) { return new HttpError(401, msg); }
  static Forbidden(   msg: string = HTTP_ERRORS[403]) { return new HttpError(403, msg); }
  static NotFound(    msg: string = HTTP_ERRORS[404]) { return new HttpError(404, msg); }
  static ServerError( msg: string = HTTP_ERRORS[500]) { return new HttpError(500, msg); }

  // Methods
  send(res: Response): Response {
    return res.status(this.status).send({
      status: this.status,
      error: this.name,
      message: this.message
    });
  }
}
