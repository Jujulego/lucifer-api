import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import jwks from 'jwks-rsa';

import { env } from 'env';

import { Token } from './token.model';

// Strategy
passport.use('auth0', new Strategy(
  {
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
  },
  async (payload: Token, done) => {
    done(null, payload);
  }
));

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
  validate(payload: Token): Token {
    return payload;
  }
}
