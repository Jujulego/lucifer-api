import { User } from 'users/user.entity';

// Class
export abstract class Context<T = any> {
  // Attributes
  readonly request: T;
  readonly abstract user: User;

  // Constructor
  constructor(request: T) {
    this.request = request;
  }
}
