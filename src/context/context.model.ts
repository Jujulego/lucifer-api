import { User } from 'users/user.entity';

// Class
export abstract class Context<T = unknown> {
  // Attributes
  readonly request: T;
  readonly abstract token?: any;
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
