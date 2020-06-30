import { Body, Controller, Get, Param, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { env } from 'env';
import { AllowIf, ScopeGuard, Scopes } from 'auth/scope.guard';

import { User } from './user.model';
import { UserService } from './user.service';
import { UpdateUser } from './user.schema';

// Controller
@Controller('/api/users')
@UseGuards(AuthGuard(env.AUTH_STRATEGY), ScopeGuard)
export class UserController {
  // Constructor
  constructor(
    private users: UserService
  ) {}

  // Endpoints
  @Get('/')
  @Scopes('read:users')
  async getUsers(): Promise<User[]> {
    return await this.users.list();
  }

  @Get('/:id')
  @Scopes('read:users')
  @AllowIf<Request>((req, token) => req.params.id === token.sub)
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.users.get(id);
  }

  @Put('/:id')
  @Scopes('update:users')
  @AllowIf<Request>((req, token) => req.params.id === token.sub)
  async putUser(@Param('id') id: string, @Body(ValidationPipe) update: UpdateUser): Promise<User> {
    return this.users.update(id, update);
  }
}
