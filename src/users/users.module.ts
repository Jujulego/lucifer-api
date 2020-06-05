import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Auth0Module } from 'auth0.module';

import { LocalUser } from './local.entity';
import { Auth0UserService } from './auth0.service';
import { LocalUserService } from './local.service';
import { UserService } from './user.service';
import { UserController } from './user.controller';

// Module
@Module({
  imports: [
    Auth0Module,
    TypeOrmModule.forFeature([LocalUser])
  ],
  providers: [
    Auth0UserService,
    LocalUserService,
    UserService
  ],
  controllers: [
    UserController
  ]
})
export class UsersModule {}
