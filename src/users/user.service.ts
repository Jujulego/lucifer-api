import { Repository } from 'typeorm';

import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { Auth0Service } from 'auth0.service';
import { DatabaseService } from 'db.service';

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
  async list(): Promise<User[]> {
    // Get user list
    return await this.repository.find();
  }

  async alist() {
    return await this.auth0.mgmtClient.getUsers();
  }

  async get(id: string, opts = { full: true }): Promise<User> {
    // Get user
    const user = await this.repository.findOne(id, {
      relations: opts.full ? ['daemons'] : []
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
