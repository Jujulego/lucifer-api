import { Document } from 'mongoose';
import jwt from 'jsonwebtoken';

import env from 'env';

// Types
export type TokenContent = string | object;

// Interface
interface Token extends Document {
  // Attributes
  readonly token: string;

  from: string;
  readonly createdAt: Date;
}

// Utils
export function generateToken(content: TokenContent): string {
  return jwt.sign(content, env.JWT_KEY);
}

export function verifyToken<T extends TokenContent>(token: string | Token) {
  // Get token
  if (typeof token !== 'string') {
    token = token.token;
  }

  // Verify
  return jwt.verify(token, env.JWT_KEY) as T;
}

export default Token;