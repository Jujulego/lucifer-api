import jwt from 'jsonwebtoken';

import { DatabaseService } from 'db.service';
import env from 'env';
import { Service } from 'utils';

import { IToken, Token } from './token.entity';
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
    return jwt.sign(token.toJSON(), env.JWT_KEY, { expiresIn: '7 days' });
  }

  async verify(token: IToken): Promise<User> {
    // Check in database
    const tk = await this.repository.findOne({
      relations: ['user'],
      where: {
        id: token.id,
        user: { id: token.user!.id }
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
