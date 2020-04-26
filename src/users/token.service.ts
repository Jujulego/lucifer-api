import jwt from 'jsonwebtoken';

import { DatabaseService } from 'db.service';
import env from 'env';
import { Service } from 'utils';

import { Token } from './token.entity';
import { User } from './user.entity';
import { HttpError } from 'middlewares/errors';

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

  async verify(token: string): Promise<User> {
    let content: Token;

    // Decrypt token
    try {
      content = jwt.verify(token, env.JWT_KEY) as Token;
    } catch (error) {
      throw HttpError.Unauthorized(error.message);
    }

    // Check in database
    const tk = await this.repository.findOne({
      relations: ['user'],
      where: {
        id: content.id,
        user: { id: content.user.id }
      }
    });

    if (!tk) throw HttpError.Unauthorized();
    return tk.user;
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Token);
  }
}
