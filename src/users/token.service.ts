import jwt from 'jsonwebtoken';

import { env } from 'env';
import { Context } from 'context';
import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';

import { IToken, Token } from './token.entity';
import { User } from './user.entity';

// Service
@Service()
export class TokenService {
  // Constructor
  constructor(
    private database: DatabaseService
  ) {}

  // Methods
  async create(ctx: Context, user: User): Promise<Token> {
    const repo = this.repository;

    // Create token
    const token = repo.create();
    token.user = user;
    token.ip = ctx.clientIp;
    token.tags = [];

    return await repo.save(token);
  }

  async list(user: User): Promise<Token[]> {
    return await this.repository.find({
      where: { user }
    });
  }

  async delete(user: User, id: string) {
    await this.repository.delete(id);
  }

  encrypt(token: Token): string {
    return jwt.sign(token.toJSON(), env.JWT_KEY, { expiresIn: '7 days' });
  }

  decrypt(token: string): IToken {
    return jwt.verify(token, env.JWT_KEY) as IToken;
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
    return tk.user!;
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Token);
  }
}
