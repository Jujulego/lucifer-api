import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import jwks from 'jwks-rsa';

import { env } from 'env';

import { User } from 'auth/user.model';

// For tests
export const JWT_KEY = 'a25tp71kchu2m8h3qcrm8hishfv7vpw77mds';

// Strategy
@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  // Constructor
  constructor() {
    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      issuer: `https://${env.AUTH0_DOMAIN}/`,
      audience: env.AUTH0_AUDIENCE
    };

    if (env.TESTS) {
      opts.secretOrKey = JWT_KEY;
    } else {
      opts.algorithms = ['RS256'];
      opts.secretOrKeyProvider = jwks.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`
      });
    }

    super(opts);
  }

  // Methods
  // noinspection JSUnusedGlobalSymbols
  validate(payload: User): User {
    return payload;
  }
}
