import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { Token, TokenContent } from './token.model';

// Controller
@Controller('/api/auth')
@UseGuards(AuthGuard(env.AUTH_STRATEGY))
export class AuthController {
  // Routes
  @Get('/permissions')
  getPermissions(@TokenContent() token: Token): string[] {
    return token.permissions;
  }
}
