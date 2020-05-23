import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwks from 'jwks-rsa';

import { env } from 'env';
import { DIContainer } from 'inversify.config';

import { IToken } from 'users/token.entity';
import { TokenService } from 'users/token.service';

// Strategy
passport.use('auth0', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKeyProvider: jwks.passportJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: env.AUTH0_JWKS
    }),
    audience: env.AUTH0_AUDIENCE,
    issuer: env.AUTH0_ISSUER,
    algorithms: ['RS256']
  },
  async (payload: IToken, done) => {
    try {
      const tokens = DIContainer.get(TokenService);
      const token = await tokens.verify(payload);

      done(null, token);
    } catch (error) {
      done(error, null);
    }
  }
));
