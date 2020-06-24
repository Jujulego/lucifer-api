import { Body, Controller, Get, Param, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { User } from './user.model';
import { UserService } from './user.service';
import { UpdateUser } from './user.schema';
import { ScopeGuard, Scopes } from 'auth/scope.guard';

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
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.users.get(id);
  }

  @Put('/:id')
  @Scopes('update:users')
  async putUser(@Param('id') id: string, @Body(ValidationPipe) update: UpdateUser): Promise<User> {
    return this.users.update(id, update);
  }
}
