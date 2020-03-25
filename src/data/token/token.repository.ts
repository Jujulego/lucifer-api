import jwt from 'jsonwebtoken';
import moment from 'moment';

import Context, { RequestContext } from 'bases/context';
import env from 'env';

import TokenHolder from './token.holder';
import { Token, TokenContent } from './token';
import { Types } from 'mongoose';

// Repository
class TokenRepository<T extends TokenHolder = TokenHolder> {
  // Methods
  getTokenById(holder: T, id: string): Token {
    return holder.tokens.id(id);
  }

  async create<C extends TokenContent>(holder: T, ctx: Context, content: C, login: boolean, expiresIn: string | number, tags?: string[]): Promise<Token> {
    // Create token
    const token = holder.tokens.create(
      TokenRepository.generateToken(ctx, content, expiresIn, tags)
    );

    holder.tokens.push(token);

    // Update last connexion
    if (login) {
      holder.lastConnexion = moment().utc().toDate();
    }

    await holder.save();
    return token;
  }

  async delete(holder: T, token: Token): Promise<T> {
    // Get token
    await token.remove();
    return await holder.save();
  }

  async clear(holder: T, except: Token[] = [], save: boolean = true): Promise<T> {
    // Filter tokens
    holder.tokens = new Types.DocumentArray<Token>(
      ...holder.tokens.filter(tk => except.find(t => t.id === tk.id))
    );

    // Save changes
    if (save) return await holder.save();
    return holder;
  }

  // Utils
  private static generateToken(ctx: Context, content: TokenContent, expiresIn: string | number, tags: string[] = []) {
    // Generate new token
    return {
      token: jwt.sign(content, env.JWT_KEY, { expiresIn }),
      from: ctx.from,
      tags: [...tags, ...this.defaultTags(ctx)]
    };
  }

  private static defaultTags(ctx: Context): string[] {
    const tags: string[] = [];

    // Postman tag
    if (ctx instanceof RequestContext) {
      const ua = ctx.request.headers['user-agent'];

      if (ua && /PostmanRuntime\/([0-9]+.?)+/.test(ua)) {
        tags.push("Postman");
      }
    }

    return tags;
  }
}

export default TokenRepository
