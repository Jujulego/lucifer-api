import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Model
export interface Token {
  sub: string;
  permissions: string[];
}

// Decorator
export const TokenContent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user as Token;
  }
);
