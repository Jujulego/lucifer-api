import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import jwks from 'jwks-rsa';

import { env } from 'env';

// Strategy
passport.use('auth0', new JwtStrategy(
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
  async (payload: any, done) => {
    done(null, payload);
  }
));
