import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { env } from 'env';

import { JwtService } from './jwt.service';
import { Token } from './token.model';

// Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  // Attributes
  private logger = new Logger(PassportStrategy.name);

  // Constructor
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JwtService.key
    });

    // Warn: should not be used out tests !
    if (!env.TESTS) {
      this.logger.warn('Using jwt auth strategy !');
    }
  }

  // Methods
  validate(payload: Token): Token {
    return payload;
  }
}
