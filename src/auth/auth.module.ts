import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { Auth0Strategy } from './auth0.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtService } from './jwt.service';

// Modules
@Module({
  imports: [
    PassportModule
  ],
  providers: [
    Auth0Strategy,
    JwtStrategy,
    JwtService
  ],
  controllers: [
    AuthController
  ]
})
export class AuthModule {}
