import { User } from 'users/user.entity';

import { Context } from './context.model';

// Context
export class TestContext<T> extends Context<T> {
  // Attributes
  readonly user: User;

  // Constructor
  constructor(request: T, user: User) {
    super(request);

    this.user = user;
  }
}
