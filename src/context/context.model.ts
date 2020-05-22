import { User } from 'users/user.entity';
import { Token } from 'users/token.entity';

// Class
export abstract class Context<T = unknown> {
  // Attributes
  readonly request: T;
  readonly abstract token?: Token;
  readonly abstract clientIp?: string;

  // Constructor
  constructor(request: T) {
    this.request = request;
  }

  // Properties
  get user(): User | undefined {
    return this.token?.user;
  }
}
