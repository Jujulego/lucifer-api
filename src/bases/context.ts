import { Request } from 'express';
import { Socket } from 'socket.io';

import User from 'data/user';
import Daemon from 'data/daemon';
import Token, { TokenHolder } from 'data/token';
import { PermissionHolder } from 'data/permission';

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

// Utils
export function fromRequest(req: Request): Context {
  return new RequestContext(req);
}

export function fromSocket(sock: Socket): Context {
  return new SocketContext(sock);
}

export default Context;
