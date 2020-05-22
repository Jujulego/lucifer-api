import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { env } from 'env';
import { DIContainer } from 'inversify.config';

import { IToken } from 'users/token.entity';
import { TokenService } from 'users/token.service';

// Strategy
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: env.JWT_KEY
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
