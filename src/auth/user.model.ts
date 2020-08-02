import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Model
export interface User {
  sub: string;
  permissions: string[];
}

// Decorator
export const ConnectedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as User;
  }
);
