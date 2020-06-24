import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';

import { Token } from './token.model';
import { Reflector } from '@nestjs/core';

// Decorator
export const Scopes = (...scopes: string[]) => SetMetadata('scopes', scopes);

// Guard
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private reflector: Reflector
  ) {}

  // Methods
  canActivate(ctx: ExecutionContext): boolean {
    // Get scopes
    const scopes = this.reflector.get<string[]>('scopes', ctx.getHandler());
    if (!scopes || scopes.length === 0) return true;

    // Get token
    const request = ctx.switchToHttp().getRequest();
    const token = request.user as Token;
    if (!token || !token.permissions) return false;

    // Match
    return scopes.every(scope => token.permissions.includes(scope));
  }
}
