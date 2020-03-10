import moment from 'moment';
import { Document } from 'mongoose';

import { HttpError } from 'middlewares/errors';

import Token, { TokenContent, TokenHolder, verifyToken } from 'data/token';

import Controller from 'bases/controller';
import Context from 'bases/context'

// Types
export type TokenObj = Omit<Token, keyof Document>;

// Class
class TokensController extends Controller<TokenHolder> {
  // Methods
  async createToken(ctx: Context, holder: TokenHolder, tags: string[] = []): Promise<TokenObj> {
    // Generate token
    const token = await holder.generateToken(ctx);
    token.tags.push(...tags);

    return token.toObject();
  }

  async deleteToken<T extends TokenHolder>(ctx: Context, holder: T, id: string): Promise<T> {
    // Generate token
    const token = holder.tokens.id(id);
    await token.remove();

    return await holder.save();
  }

  async login(ctx: Context, holder: TokenHolder, tags: string[] = []): Promise<Token> {
    // Generate token
    const token = await holder.generateToken(ctx);
    token.tags.push(...tags);

    // Store date and save
    holder.lastConnexion = moment().utc().toDate();
    await holder.save();

    return token;
  }

  async authenticate<T extends TokenHolder, C extends TokenContent>(token: string | undefined, getter: (content: C, token: string) => Promise<T | null>): Promise<T> {
    // Decode token
    if (!token) throw HttpError.Unauthorized();
    let data: C;

    try {
      data = verifyToken<C>(token);
    } catch (error) {
      console.error(error);
      throw HttpError.Unauthorized();
    }

    // Find holder
    const holder = await getter(data, token);
    if (!holder) throw HttpError.Unauthorized();

    return holder;
  }

  async logout(ctx: Context) {
    if (ctx.token) {
      await (await ctx.token).remove();
      await (await ctx.tokens)?.save();
    }
  }
}

// Controller
const Tokens = new TokensController();
export default Tokens;
