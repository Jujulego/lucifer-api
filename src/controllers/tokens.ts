import { Request } from 'express'
import moment from 'moment';
import { Document } from 'mongoose';

import { HttpError } from 'middlewares/errors';

import Token, { TokenContent, TokenHolder, verifyToken } from 'data/token';
import Controller from 'utils/controller';

// Types
export type TokenObj = Omit<Token, keyof Document>;

// Class
class TokensController extends Controller {
  // Constructor
  constructor() { super(); }

  // Methods
  async createToken(req: Request, holder: TokenHolder, tags: string[] = []): Promise<TokenObj> {
    // Generate token
    const token = await holder.generateToken(req);
    token.tags.push(...tags);

    await holder.save();
    return token.toObject();
  }

  async deleteToken<T extends TokenHolder>(req: Request, holder: T, id: string): Promise<T> {
    // Generate token
    const token = holder.tokens.id(id);
    await token.remove();

    return await holder.save();
  }

  async login(req: Request, holder: TokenHolder, tags: string[] = []): Promise<Token> {
    // Generate token
    const token = await holder.generateToken(req);
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
}

// Controller
const Tokens = new TokensController();
export default Tokens;
