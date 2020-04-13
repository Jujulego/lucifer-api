import { Request } from 'express';

import { Daemon } from 'data/daemon/daemon';
import PermissionHolder from 'data/permission/permission.holder';
import { Token } from 'data/token/token';
import TokenHolder from 'data/token/token.holder';
import { User } from 'data/user/user';

// Type
type Awaitable<T> = Promise<T> | T;

// Interface
interface ContextAttrs {
  // Objects
  user?:   Awaitable<User>;
  daemon?: Awaitable<Daemon>;
  token?:  Awaitable<Token>;
}

// Class
abstract class Context {
  // Attributes
  readonly user?:   Awaitable<User>;
  readonly daemon?: Awaitable<Daemon>;
  readonly token?:  Awaitable<Token>;

  // Constructor
  protected constructor(attrs: ContextAttrs) {
    this.user = attrs.user;
    this.daemon = attrs.daemon;
    this.token = attrs.token;
  }

  // Getters
  abstract get from(): string;

   get permissions(): Awaitable<PermissionHolder> | undefined {
    return this.user || this.daemon;
  }

  get tokens(): Awaitable<TokenHolder> | undefined {
    return this.user || this.daemon;
  }
}

export class RequestContext extends Context {
  // Attributes
  readonly request: Request;

  // Constructor
  constructor(request: Request) {
    super({
      user:   request.user,
      daemon: request.daemon,
      token:  request.token
    });

    this.request = request;
  }

  // Getters
  get from(): string {
    return this.request.ip;
  }
}

export class TestContext extends Context {
  // Attributes
  readonly from: string;

  // Constructor
  constructor(attrs: ContextAttrs, from: string) {
    super(attrs);
    this.from = from;
  }

  // Statics
  static withDaemon(daemon: Daemon, from: string): Context {
    return new TestContext({ daemon }, from);
  }

  static withUser(user: User, from: string, token?: Token): Context {
    return new TestContext({ user, token }, from);
  }

  static notConnected(from: string): Context {
    return new TestContext({}, from);
  }
}

// Utils
export function fromRequest(req: Request): Context {
  return new RequestContext(req);
}

export default Context;
