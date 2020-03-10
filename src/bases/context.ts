import { Request } from 'express';
import { Socket } from 'socket.io';

import User from 'data/user';
import Daemon from 'data/daemon';
import Token, { TokenHolder } from 'data/token';
import { PermissionHolder } from 'data/permission';

// Interface
interface ContextAttrs {
  // Objects
  user?:   Promise<User>   | User;
  daemon?: Promise<Daemon> | Daemon;
  token?:  Promise<Token>  | Token;
}

// Class
abstract class Context {
  // Attributes
  readonly user?:   Promise<User>   | User;
  readonly daemon?: Promise<Daemon> | Daemon;
  readonly token?:  Promise<Token>  | Token;

  // Constructor
  protected constructor(attrs: ContextAttrs) {
    this.user = attrs.user;
    this.daemon = attrs.daemon;
    this.token = attrs.token;
  }

  // Getters
  abstract get from(): string;

   get permissions(): Promise<PermissionHolder> | PermissionHolder | undefined {
    return this.user || this.daemon;
  }

  get tokens(): Promise<TokenHolder> | TokenHolder | undefined {
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
