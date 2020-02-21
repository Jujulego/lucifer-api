import { Document } from 'mongoose';
import jwt from 'jsonwebtoken';

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