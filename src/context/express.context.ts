import { Request } from 'express';
import { Token } from 'auth/token.model';

import { Context } from './context.model';

// Class
export class ExpressContext extends Context<Request> {
  // Properties
  get token(): Token | undefined {
    return this.request.token;
  }

  get clientIp(): string {
    return this.request.ip;
  }
}
