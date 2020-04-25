import { DatabaseService } from 'db.service';
import { Service } from 'utils';

import { User } from './user.entity';
import { HttpError } from 'middlewares/errors';
import validator from 'validator';

// Types
export type UserCreate = Pick<User, 'email' | 'password'>;
export type UserUpdate = Partial<Pick<User, 'email' | 'password'>>;

// Service
@Service(UserService)
export class UserService {
  // Constructor
  constructor(
    private database: DatabaseService
  ) {}

  // Methods
  async create(data: UserCreate): Promise<User> {
    const repo = this.repository;

    // Validate
    const missing: string[] = [];
    if (!data.email)    missing.push('email');
    if (!data.password) missing.push('password');
    if (missing.length > 0) throw HttpError.BadRequest(`Missing parameters ${missing.join(', ')}`);

    if (validator.isEmail(data.email)) throw HttpError.BadRequest(`Invalid value for email`);

    // Create user
    const user = repo.create();
    user.email = data.email;
    user.password = data.password;

    return await repo.save(user);
  }

  async list(): Promise<User[]> {
    // Get user list
    return await this.repository.find();
  }

  async get(id: string): Promise<User> {
    // Get user
    const user = await this.repository.findOne(id);
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return user;
  }

  async update(id: string, update: UserUpdate): Promise<User> {
    // Get user
    const user = await this.get(id);

    // Validate
    if (update.email && validator.isEmail(update.email)) throw HttpError.BadRequest(`Invalid value for email`);

    // Apply update
    if (update.email)    user.email    = update.email;
    if (update.password) user.password = update.password;

    // Save
    return await this.repository.save(user);
  }

  async delete(id: string) {
    await this.repository.delete(id);
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(User);
  }
}
