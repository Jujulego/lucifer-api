import jwt from 'jsonwebtoken';

import { DatabaseService } from 'db.service';
import env from 'env';
import { Service } from 'utils';

import { Token } from './token.entity';
import { User } from './user.entity';

// Service
@Service(TokenService)
export class TokenService {
  // Constructor
  constructor(
    private database: DatabaseService
  ) {}

  // Methods
  async create(user: User): Promise<Token> {
    const repo = this.repository;

    // Create token
    const token = repo.create();
    token.user = user;
    token.tags = [];

    return await repo.save(token);
  }

  encrypt(token: Token): string {
    return jwt.sign(token, env.JWT_KEY, { expiresIn: '7 days' });
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Token);
  }
}
