import jwt from 'jsonwebtoken';

import { env } from 'env';
import { JWT_KEY } from 'auth/auth0.strategy';

// Utils
export async function login(user: string, permissions?: string[]): Promise<string> {
  return jwt.sign({
    iss: `https://${env.AUTH0_DOMAIN}/`,
    aud: env.AUTH0_AUDIENCE,
    sub: user,
    permissions,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 5 * 60,
  }, JWT_KEY);
}
