import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwks from 'jwks-rsa';

import { env } from 'env';

import { User } from 'auth/user.model';

// Strategy
@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  // Constructor
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwks.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${env.AUTH0_DOMAIN}/.well-known/jwks.json`
      }),
      issuer: `https://${env.AUTH0_DOMAIN}/`,
      audience: env.AUTH0_AUDIENCE,
      algorithms: ['RS256']
    });
  }

  // Methods
  // noinspection JSUnusedGlobalSymbols
  validate(payload: User): User {
    return payload;
  }
}
