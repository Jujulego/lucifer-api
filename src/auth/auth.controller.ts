import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User, ConnectedUser } from 'auth/user.model';

// Controller
@Controller('/api/auth')
@UseGuards(AuthGuard('auth0'))
export class AuthController {
  // Routes
  @Get('/permissions')
  getPermissions(@ConnectedUser() user: User): string[] {
    return user.permissions;
  }
}
