import { User } from 'users/user.entity';

import { Context } from './context.model';

// Interfaces
export interface TestRequest {
  user?: User;
  clientIp?: string;
}

// Context
export class TestContext extends Context<TestRequest> {
  // Attributes
  readonly user?: User;
  readonly clientIp?: string;

  // Constructor
  constructor(request: TestRequest) {
    super(request);

    this.user = request.user;
    this.clientIp = request.clientIp;
  }
}
