import { Request } from 'express';

import User from 'data/user';
import Daemon from 'data/daemon';
import Token, { TokenHolder } from 'data/token';
import { PermissionHolder } from 'data/permission';

// Interface
interface ContextAttrs {
  // Objects
  user?: User;
  daemon?: Daemon;
  token?: Token;
}

// Class
abstract class Context {
  // Attributes
  readonly user?: User;
  readonly daemon?: Daemon;
  readonly token?: Token;

  // Constructor
  protected constructor(attrs: ContextAttrs) {
    this.user = attrs.user;
    this.daemon = attrs.daemon;
    this.token = attrs.token;
  }

  // Getters
  abstract get from(): string;

  get permissions(): PermissionHolder | undefined {
    return this.user || this.daemon;
  }

  get tokens(): TokenHolder | undefined {
    return this.user || this.daemon;
  }
}

export class RequestContext extends Context {
  // Attributes
  readonly request: Request;

  // Constructor
  constructor(request: Request) {
    super({
      user: request.user,
      daemon: request.daemon,
      token: request.token
    });

    this.request = request;
  }

  // Getters
  get from(): string {
    return this.request.ip;
  }
}

// Utils
export function fromRequest(req: Request): Context {
  return new RequestContext(req);
}

export default Context;
