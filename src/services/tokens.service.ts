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
  // Attributes
  private readonly tokenRepo = new TokenRepository();

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

  async authenticate<H extends TokenHolder, C extends TokenContent>(token: string | undefined, getter: (content: C, token: string) => Promise<H | null>): Promise<H> {
    // Decode token
    if (!token) throw HttpError.Unauthorized();
    let data: C;

    try {
      data = this.verifyToken<C>(token);
    } catch (error) {
      console.error(error.message);
      throw HttpError.Unauthorized();
    }

    // Find holder
    const holder = await getter(data, token);
    if (!holder) throw HttpError.Unauthorized();

    return holder;
  }

  async logout(ctx: Context) {
    if (ctx.tokens) {
      const holder = await ctx.tokens;
      const token = await ctx.token!;

      await this.tokenRepo.delete(holder, token);
    }
  }
}

export default TokensService;
