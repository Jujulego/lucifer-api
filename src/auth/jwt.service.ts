import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';

// Service
@Injectable()
export class JwtService {
  // Attributes
  static readonly key: string = 'a25tp71kchu2m8h3qcrm8hishfv7vpw77mds';

  // Methods
  generate(user: string, permissions: string[] = []): string {
    return jwt.sign({
      sub: user,
      permissions
    }, JwtService.key);
  }
}
