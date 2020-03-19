import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import { HttpError } from 'middlewares/errors';

import { Token, TokenContent } from 'data/token/token.types';
import { TokenHolder } from 'data/token/token.holder';

import env from 'env';

// Service
@injectable()
class TokensService {
  // Methods
  verifyToken<C extends TokenContent>(token: string | Token): C {
    // Get token
    if (typeof token !== 'string') {
      token = token.token;
    }

    // Verify
    return jwt.verify(token, env.JWT_KEY) as C;
  }

  async authenticate<H extends TokenHolder, C extends TokenContent>(token: string | undefined, getter: (content: C, token: string) => Promise<H | null>): Promise<H> {
    // Decode token
    if (!token) throw HttpError.Unauthorized();
    let data: C;

    try {
      data = this.verifyToken<C>(token);
    } catch (error) {
      console.error(error);
      throw HttpError.Unauthorized();
    }

    // Find holder
    const holder = await getter(data, token);
    if (!holder) throw HttpError.Unauthorized();

    return holder;
  }
}

export default TokensService;
