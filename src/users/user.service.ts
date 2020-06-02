import { Repository } from 'typeorm';
import validator from 'validator';

import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { Auth0Service } from 'auth0.service';
import { DatabaseService } from 'db.service';
import { LRN } from 'resources/lrn.model';

import { User } from './user.entity';

// Service
@Service()
export class UserService {
  // Constructor
  constructor(
    private database: DatabaseService,
    private auth0: Auth0Service
  ) {}

  // Methods
  static lrn(id: string): LRN {
    return new LRN('user', id);
  }

  async list(): Promise<User[]> {
    // Get user list
    return await this.repository.find();
  }

  async alist() {
    return await this.auth0.mgmtClient.getUsers();
  }

  async get(id: string, opts = { full: true }): Promise<User> {
    if (!validator.isUUID(id)) throw HttpError.NotFound();

    // Get user
    const user = await this.repository.findOne(id, {
      relations: opts.full ? ['tokens'] : []
    });

    // Throw if not found
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return user;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Properties
  get repository(): Repository<User> {
    return this.database.connection.getRepository(User);
  }
}
