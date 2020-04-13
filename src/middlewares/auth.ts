import { NextFunction, Request, Response } from 'express';

import DIContainer from 'inversify.config';
import { aroute, parseLRN } from 'utils';

import { HttpError } from 'middlewares/errors';
import { Token } from 'data/token/token';

import DaemonsService from 'services/daemons.service';
import TokensService from 'services/tokens.service';
import UsersService from 'services/users.service';

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

export default auth;
