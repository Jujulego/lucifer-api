import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { env } from 'env';

import { Auth0Strategy } from './auth0.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from './jwt.service';

// Modules
@Module({
  imports: [PassportModule],
  providers: [
    ...(env.AUTH_STRATEGY === 'auth0' ? [
      Auth0Strategy
    ] : []),
    ...(env.AUTH_STRATEGY === 'jwt' ? [
      JwtStrategy,
      JwtService
    ] : [])
  ]
})
export class AuthModule {}
