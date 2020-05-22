import { Request } from 'express';

import { Token } from 'users/token.entity';

import { Context } from './context.model';

// Class
export class ExpressContext extends Context<Request> {
  // Properties
  get token(): Token {
    return this.request.token;
  }

  get clientIp(): string {
    return this.request.ip;
  }
}
