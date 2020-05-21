import { User } from 'users/user.entity';

// Class
export abstract class Context<T = unknown> {
  // Attributes
  readonly request: T;
  readonly abstract user?: User;
  readonly abstract clientIp?: string;

  // Constructor
  constructor(request: T) {
    this.request = request;
  }
}
