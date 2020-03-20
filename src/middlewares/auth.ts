import { NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';

import { Daemon } from 'data/daemon/daemon.types';
import { Token } from 'data/token/token.types';
import { User } from 'data/user/user.types';

import UsersService from 'services/users.service';

import DIContainer from 'inversify.config';
import { aroute } from 'utils';

// Add properties to Request
declare global {
  namespace Express {
    interface Request {
      user?: User;
      daemon?: Daemon;
      token?: Token;
    }
  }

  namespace SocketIO {
    interface Socket {
      user: () => Promise<User>;
      token: () => Promise<Token>;
    }
  }
}

// Containers
const Users = () => DIContainer.get(UsersService);

// Middlewares
const auth = aroute(async (req: Request, res: Response, next: NextFunction) => {
  // Authenticate user
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const user = await Users().authenticate(token);

  // Store in request
  req.user = user;
  req.token = user.tokens.find(tk => tk.token === token) as Token;

  next();
});

export async function wsauth(socket: Socket, next: (err?: any) => void) {
  try {
    // Authenticate user
    const { token } = socket.handshake.query;
    const user = await Users().authenticate(token);

    // Access to user from socket
    socket.user = async () => await Users().getByToken(user.id, token);
    socket.token = async () => {
      const user = await socket.user();
      return user.tokens.find(tk => tk.token === token) as Token;
    };

    return next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
}

export default auth;
