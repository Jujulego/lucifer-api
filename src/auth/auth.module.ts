import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { Auth0Strategy } from './auth0.strategy';

// Modules
@Module({
  imports: [
    PassportModule
  ],
  providers: [
    Auth0Strategy
  ],
  controllers: [
    AuthController
  ]
})
export class AuthModule {}
