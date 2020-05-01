import { Response } from 'express';

// Constants
const NAMES = {
  400: 'BadRequest',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Time-out',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Request Entity Too Large',
  414: 'Request URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Requested Range Unsatisfiable',
  417: 'Expectation Failed',
  418: 'I\'m a teapot',
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Method Failure',
  425: 'Unordered Collection',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  449: 'Retry With',
  450: 'Blocked by Windows Parental Controls',
  451: 'Unavailable For Legal Reasons',
  456: 'Unrecoverable Error',
  500: 'Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Time-out',
  505: 'HTTP Version not supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient storage',
  508: 'Loop detected',
  509: 'Bandwidth Limit Exceeded',
  510: 'Not extended',
  511: 'Network authentication required',
}

// Class
export class HttpError implements Error {
  // Attributes
  readonly name: string;
  readonly message: string;
  readonly code: number;

  // Constructor
  constructor(code: keyof typeof NAMES, message: string) {
    this.name = NAMES[code];
    this.message = message;
    this.code = code;
  }

  // Statics
  static BadRequest(  msg: string = NAMES[400]) { return new HttpError(400, msg); }
  static Unauthorized(msg: string = NAMES[401]) { return new HttpError(401, msg); }
  static Forbidden(   msg: string = NAMES[403]) { return new HttpError(403, msg); }
  static NotFound(    msg: string = NAMES[404]) { return new HttpError(404, msg); }
  static ServerError( msg: string = NAMES[500]) { return new HttpError(500, msg); }

  // Methods
  send(res: Response): Response {
    return res.status(this.code).send({
      code: this.code,
      error: this.message
    });
  }
}
