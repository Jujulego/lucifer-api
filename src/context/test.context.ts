import { User } from 'users/user.entity';
import { Token } from 'users/token.entity';

import { Context } from './context.model';

// Interfaces
export interface TestRequest {
  user?: User;
  token?: Token;
  clientIp?: string;
}

// Context
export class TestContext extends Context<TestRequest> {
  // Attributes
  readonly _user?: User;
  readonly token?: Token;
  readonly clientIp?: string;

  // Constructor
  constructor(request: TestRequest) {
    super(request);

    this._user = request.user;
    this.token = request.token;
    this.clientIp = request.clientIp;
  }

  // Properties
  get user(): User | undefined {
    return this._user || this.token?.user;
  }
}
