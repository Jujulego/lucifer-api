import jwt from 'jsonwebtoken';

import Context from 'bases/context';

import { HttpError } from 'middlewares/errors';

import { Token, TokenContent } from 'data/token/token';
import TokenHolder from 'data/token/token.holder';
import TokenRepository from 'data/token/token.repository';

import env from 'env';
import { Service } from 'utils';

// Service
@Service(TokensService)
class TokensService {
  // Statics
  private static getTokenRepository<H extends TokenHolder>(holder: H): TokenRepository<H> {
    return new TokenRepository<H>(holder)
  }

  // Methods
  verifyToken<C extends TokenContent>(token: string | Token): C {
    try {
      // Get token
      if (typeof token !== 'string') {
        token = token.token;
      }

      // Verify
      return jwt.verify(token, env.JWT_KEY) as C;
    } catch (error) {
      console.log(error.message);
      throw HttpError.Unauthorized();
    }
  }

  async logout(ctx: Context) {
    if (ctx.tokens) {
      const holder = await ctx.tokens;
      const token = await ctx.token!;

      await TokensService.getTokenRepository(holder).delete(token);
    }
  }
}

export default TokensService;
