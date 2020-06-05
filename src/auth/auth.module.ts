import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { Auth0Strategy } from './auth0.strategy';
import { JwtStrategy } from './jwt.strategy';

// Modules
@Module({
  imports: [PassportModule],
  providers: [
    Auth0Strategy,
    JwtStrategy
  ]
})
export class AuthModule {}
