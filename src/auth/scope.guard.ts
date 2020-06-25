import { CanActivate, ExecutionContext, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Token } from './token.model';

// Types
export type AllowIfCallback<R = any> = (req: R, token: Token) => boolean;

// Decorators
export const Scopes = (...scopes: string[]) => SetMetadata('scopes', scopes);
export const AllowIf = <R = any> (cb: AllowIfCallback<R>) => SetMetadata('scopes:allow', cb);

// Guard
@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(
    private reflector: Reflector
  ) {}

  // Methods
  canActivate(ctx: ExecutionContext): boolean {
    // Get metadata
    const scopes = this.reflector.get<string[]>('scopes', ctx.getHandler());
    const allow = this.reflector.get<AllowIfCallback>('scopes:allow', ctx.getHandler());

    if (!scopes || scopes.length === 0) return true;

    // Get token
    const request = ctx.switchToHttp().getRequest();
    const token = request.user as Token;
    if (!token || !token.permissions) return false;

    // Match
    if (allow && allow(request, token)) return true;
    return scopes.every(scope => token.permissions.includes(scope));
  }
}
