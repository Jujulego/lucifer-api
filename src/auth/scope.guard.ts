import { CanActivate, CustomDecorator, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { User } from 'auth/user.model';

// Types
export type AllowIfCallback<R> = (req: R, user: User) => boolean;

// Symbols
const METADATA_KEYS = {
  scopes: Symbol('scope:scopes'),
  allow:  Symbol('scope:allow'),
}

// Decorators
export function Scopes(...scopes: string[]): CustomDecorator<symbol> {
  return SetMetadata(METADATA_KEYS.scopes, scopes);
}

export function AllowIf<R = any>(cb: AllowIfCallback<R>): CustomDecorator<symbol> {
  return SetMetadata(METADATA_KEYS.allow, cb);
}

// Guard
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private reflector: Reflector
  ) {}

  // Methods
  canActivate(ctx: ExecutionContext): boolean {
    // Get metadata
    const scopes = this.reflector.get<string[]>(METADATA_KEYS.scopes, ctx.getHandler());
    const allow = this.reflector.get<AllowIfCallback<any>>(METADATA_KEYS.allow, ctx.getHandler());

    if (!scopes || scopes.length === 0) return true;

    // Get token
    const request = ctx.switchToHttp().getRequest();
    const token = request.user as User;
    if (!token || !token.permissions) return false;

    // Match
    if (allow && allow(request, token)) return true;
    return scopes.every(scope => token.permissions.includes(scope));
  }
}
