import { Injectable, Scope } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import passport from 'passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { JWTService } from './jwt.service';
import { Token } from './token.model';

// Warn should be used only in test
// console.warn('Using jwt auth strategy');

// Strategy
passport.use('jwt', new Strategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWTService.key
  },
  async (payload: Token, done) => {
    done(null, payload);
  }
));

@Injectable({ scope: Scope.TRANSIENT })
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // Constructor
  constructor() {
    console.warn('Using jwt auth strategy');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWTService.key
    });
  }

  // Methods
  validate(payload: Token): Token {
    return payload;
  }
}
