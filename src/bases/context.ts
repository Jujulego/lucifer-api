import { Request } from 'express';
import { Socket } from 'socket.io';

import { Daemon } from 'data/daemon/daemon';
import PermissionHolder from 'data/permission/permission.holder';
import { Token } from 'data/token/token';
import TokenHolder from 'data/token/token.holder';
import { User } from 'data/user/user';

// Type
type Awaitable<T> = Promise<T> | T;

type Options = { from: string };
export type ContextParams = Options & ({ user: User } | { daemon: Daemon });
export type ContextMatrix<P> = Array<ContextParams & P>;

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

export class SocketContext extends Context {
  // Attributes
  readonly socket: Socket;

  // Constructor
  constructor(socket: Socket) {
    super({
      user:  socket.user(),
      token: socket.token()
    });

    this.socket = socket;
  }

  // Getters
  get from(): string {
    return this.socket.handshake.address;
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

  static withUser(user: User, from: string): Context {
    return new TestContext({ user }, from);
  }

  static fromParams(params: ContextParams): Context {
    if ('user' in params) {
      return TestContext.withUser(params.user, params.from);
    }

    return TestContext.withDaemon(params.daemon, params.from);
  }

  static async map<P = {}>(matrix: ContextMatrix<P>, cb: (ctx: Context, p: P) => Promise<void>) {
    await Promise.all(matrix.map(p => cb(TestContext.fromParams(p), p)));
  }
}

// Utils
export function fromRequest(req: Request): Context {
  return new RequestContext(req);
}

export function fromSocket(sock: Socket): Context {
  return new SocketContext(sock);
}

export default Context;
