import { Token } from 'auth/token.model';

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
}
