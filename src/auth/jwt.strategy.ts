import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { env } from 'env';

// Strategy
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_KEY
  },
  async (payload: any, done) => {
    try {
      // const tokens = DIContainer.get(TokenService);
      // const token = await tokens.verify(payload);

      done(null, payload);
    } catch (error) {
      done(error, null);
    }
  }
));
