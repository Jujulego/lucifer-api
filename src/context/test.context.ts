import { Token } from 'auth/token.model';

import { Context } from './context.model';

// Interfaces
export interface TestRequest {
  token?: Token;
  clientIp?: string;
}

// Context
export class TestContext extends Context<TestRequest> {
  // Attributes
  readonly token?: Token;
  readonly clientIp?: string;

  // Constructor
  constructor(request: TestRequest) {
    super(request);

    this.token = request.token;
    this.clientIp = request.clientIp;
  }
}
