import { Document, Types } from 'mongoose';
import jwt from 'jsonwebtoken';

import Context, { RequestContext } from 'bases/context';
import env from 'env';

// Interface
interface Token extends Document {
  // Attributes
  readonly token: string;

  readonly from: string;
  readonly tags: string[];
  readonly createdAt: Date;
}

// Types
export type TokenContent = string | object;
export interface TokenHolder extends Document {
  // Attributes
  lastConnexion?: Date;
  readonly tokens: Types.DocumentArray<Token>;

  // Methods
  generateToken(ctx: Context): Token | Promise<Token>
}

// Utils
export function generateToken(holder: TokenHolder, ctx: Context, content: TokenContent, expiresIn: string | number = '7 days'): Token {
  // Tags
  const tags: string[] = [];

  if (ctx instanceof RequestContext) {
    const ua = ctx.request.headers['user-agent'];

    if (ua && /PostmanRuntime\/([0-9]+.?)+/.test(ua)) {
      tags.push("Postman");
    }
  }

  // Generate new token
  const token = holder.tokens.create({
    token: jwt.sign(content, env.JWT_KEY, { expiresIn }),
    from: ctx.from, tags
  });

  // Add and return
  holder.tokens.push(token);
  return token;
}

export function verifyToken<T extends TokenContent>(token: string | Token): T {
  // Get token
  if (typeof token !== 'string') {
    token = token.token;
  }

  // Verify
  return jwt.verify(token, env.JWT_KEY) as T;
}

export default Token;
