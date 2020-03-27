import jwt from 'jsonwebtoken';
import moment from 'moment';

import Context, { RequestContext } from 'bases/context';
import env from 'env';

import TokenHolder from './token.holder';
import { Token, TokenContent } from './token';

// Repository
class TokenRepository<H extends TokenHolder = TokenHolder> {
  // Constructor
  constructor(private holder: H) {}

  // Methods
  async create<C extends TokenContent>(ctx: Context, content: C, login: boolean, expiresIn: string | number, tags?: string[]): Promise<Token> {
    // Create token
    const token = this.holder.tokens.create(
      TokenRepository.generateToken(ctx, content, expiresIn, tags)
    );

    this.holder.tokens.push(token);

    // Update last connexion
    if (login) {
      this.holder.lastConnexion = moment().utc().toDate();
    }

    await this.holder.save();
    return token;
  }

  getById(id: string): Token {
    return this.holder.tokens.id(id);
  }

  async delete(token: Token): Promise<H> {
    // Check if has token
    const tk = this.getById(token.id);
    if (!tk) return this.holder;

    // Delete token
    await tk.remove();

    return await this.holder.save();
  }

  async clear(except: Token[] = [], save: boolean = true): Promise<H> {
    // Filter tokens
    await Promise.all(this.holder.tokens
      .filter(tk => !except.find(t => t.id === tk.id))
      .map(tk => tk.remove())
    );

    // Save changes
    if (!save) return this.holder;
    return await this.holder.save();
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
