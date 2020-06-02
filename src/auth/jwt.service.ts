import jwt from 'jsonwebtoken';

import { Service } from 'utils';

// Service
@Service({ singleton: true })
export class JWTService {
  // Attributes
  static readonly key: string = 'a25tp71kchu2m8h3qcrm8hishfv7vpw77mds';

  // Methods
  generate(user: string): string {
    return jwt.sign({ sub: user }, JWTService.key);
  }
}
