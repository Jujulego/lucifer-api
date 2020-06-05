import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from './user.model';
import { UserService } from './user.service';
import { env } from 'env';

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
}
