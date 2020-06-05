import { Controller, Get, Param } from '@nestjs/common';

import { User } from './user.model';
import { UserService } from './user.service';

// Controller
@Controller('/api/users')
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
