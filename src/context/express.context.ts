import { Request } from 'express';

import { Context } from './context.model';

// Class
export class ExpressContext extends Context<Request> {
  // Properties
  get token(): any {
    return this.request.token;
  }

  get clientIp(): string {
    return this.request.ip;
  }
}
