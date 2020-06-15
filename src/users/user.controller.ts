import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { User } from './user.model';
import { UserService } from './user.service';
import { UpdateUser } from './user.schema';

// Controller
@Controller('/api/users')
@UseGuards(AuthGuard(env.AUTH_STRATEGY))
export class UserController {
  // Constructor
  constructor(
    private users: UserService
  ) {}

  // Endpoints
  @Get('/')
  async getUsers(): Promise<User[]> {
    return await this.users.list();
  }

  @Get('/:id')
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.users.get(id);
  }

  @Put('/:id')
  async putUser(@Param('id') id: string, @Body() update: UpdateUser): Promise<User> {
    return this.users.update(id, update);
  }
}
