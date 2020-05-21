import { Request } from 'express';

import { User } from 'users/user.entity';

import { Context } from './context.model';

// Class
export class ExpressContext extends Context<Request> {
  // Properties
  get user(): User {
    return this.request.user as User;
  }

  get clientIp(): string {
    return this.request.ip;
  }
}
