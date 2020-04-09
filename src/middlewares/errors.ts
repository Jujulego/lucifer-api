import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

// Class
export class HttpError implements Error {
  // Attributes
  readonly name: string;
  readonly message: string;
  readonly code: number;

  // Constructor
  constructor(code: number, message: string, name: string = 'HttpError') {
    this.name = name;
    this.message = message;
    this.code = code;
  }

  // Statics
  static BadRequest(  msg: string = 'Bad Request')  { return new HttpError(400, msg, 'BadRequest');   }
  static Unauthorized(msg: string = 'Unauthorized') { return new HttpError(401, msg, 'Unauthorized'); }
  static Forbidden(   msg: string = 'Forbidden')    { return new HttpError(403, msg, 'Forbidden');    }
  static NotFound(    msg: string = 'Not Found')    { return new HttpError(404, msg, 'NotFound');     }
  static ServerError( msg: string = 'Server Error') { return new HttpError(500, msg, 'ServerError');  }

  // Methods
  send(res: Response): Response {
    return res.status(this.code).send({
      code: this.code,
      error: this.message
    });
  }
}

// Middleware
const errors = (): ErrorRequestHandler => (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return err.send(res);
  }

  if (err instanceof Error) {
    console.error(err.stack);
    return HttpError.ServerError(err.message).send(res);
  }

  next(err);
};

export default errors;
