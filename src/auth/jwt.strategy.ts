import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import { JWTService } from './jwt.service';
import { Token } from './token.model';

// Strategy
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWTService.key
  },
  async (payload: Token, done) => {
    done(null, payload);
  }
));
