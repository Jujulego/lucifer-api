import { injectable } from 'inversify';
import jwt from 'jsonwebtoken';

import { Token, TokenContent } from 'data/token/token.types';

import env from 'env';

// Service
@injectable()
class TokensService {
  // Methods
  verifyToken<T extends TokenContent>(token: string | Token): T {
    // Get token
    if (typeof token !== 'string') {
      token = token.token;
    }

    // Verify
    return jwt.verify(token, env.JWT_KEY) as T;
  }
}

export default TokensService;
