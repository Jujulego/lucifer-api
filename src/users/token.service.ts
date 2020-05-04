import jwt from 'jsonwebtoken';

import { env } from 'env';
import { Service } from 'utils';

import { DatabaseService } from 'db.service';
import { HttpError } from 'errors/errors.model';

import { IToken, Token } from './token.entity';
import { User } from './user.entity';
import validator from 'validator';

// Service
@Service()
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

  async get(user: User, id: string): Promise<Token> {
    if (!validator.isUUID(id)) throw HttpError.NotFound();

    // Get token
    const token = await this.repository.findOne(id,{
      where: { user }
    });

    // Throw if not found
    if (!token) throw HttpError.NotFound(`Token ${id} not found`);

    return token;
  }

  async list(user: User): Promise<Token[]> {
    return await this.repository.find({
      where: { user }
    });
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
    return tk.user!;
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Token);
  }
}
