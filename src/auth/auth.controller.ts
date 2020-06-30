import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { Token, UseToken } from './token.model';

// Controller
@Controller('/api/auth')
@UseGuards(AuthGuard(env.AUTH_STRATEGY))
export class AuthController {
  // Routes
  @Get('/permissions')
  getPermissions(@UseToken() token: Token): string[] {
    return token.permissions;
  }
}
