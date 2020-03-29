import { NextFunction, Request, Response } from 'express';
import { Socket } from 'socket.io';

import DIContainer from 'inversify.config';

import { Daemon } from 'data/daemon/daemon';
import { Token } from 'data/token/token';
import { User } from 'data/user/user';

import DaemonsService from 'services/daemons.service';
import TokensService from 'services/tokens.service';
import UsersService from 'services/users.service';

import { aroute, parseLRN } from 'utils';
import { HttpError } from 'middlewares/errors';

// Add properties to Request
declare global {
  namespace Express {
    // noinspection JSUnusedGlobalSymbols
    interface Request {
      user?: User;
      daemon?: Daemon;
      token?: Token;
    }
  }

  namespace SocketIO {
    // noinspection JSUnusedGlobalSymbols
    interface Socket {
      user: () => Promise<User>;
      token: () => Promise<Token>;
    }
  }
}

// Middlewares
const auth = aroute(async (req: Request, res: Response, next: NextFunction) => {
  // Containers
  const Daemons = DIContainer.get(DaemonsService);
  const Tokens = DIContainer.get(TokensService);
  const Users = DIContainer.get(UsersService);

  // Get token
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) throw HttpError.Unauthorized();

  // Authenticate user/daemon
  const content = Tokens.verifyToken(token);
  const lrn = parseLRN(content.lrn);
  if (!lrn) throw HttpError.Unauthorized();

  switch (lrn.type) {
    case 'daemon': {
      const daemon = await Daemons.getByToken(lrn.id, token);

      req.daemon = daemon;
      req.token = daemon.tokens.find(tk => tk.token === token) as Token;
      break;
    }

    case 'user': {
      const user = await Users.getByToken(lrn.id, token);

      req.user = user;
      req.token = user.tokens.find(tk => tk.token === token) as Token;
      break;
    }

    default:
      throw HttpError.Unauthorized();
  }

  next();
});

export async function wsauth(socket: Socket, next: (err?: any) => void) {
  // Containers
  const Tokens = DIContainer.get(TokensService);
  const Users = DIContainer.get(UsersService);

  // Get token
  const { token } = socket.handshake.query;
  if (!token) throw HttpError.Unauthorized();

  // Authenticate user
  const content = Tokens.verifyToken(token);
  const lrn = parseLRN(content.lrn);
  if (!lrn || lrn.type != 'user') throw HttpError.Unauthorized();

  const user = await Users.getByToken(lrn.id, token);

  // Access to user from socket
  socket.user = async () => await Users.getByToken(user.id, token);
  socket.token = async () => {
    const user = await socket.user();
    return user.tokens.find(tk => tk.token === token) as Token;
  };

  return next();
}

export default auth;
