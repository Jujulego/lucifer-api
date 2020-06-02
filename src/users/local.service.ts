import validator from 'validator';

import { Service, transaction } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService, EntityService } from 'db.service';

import { LocalUser } from './local.entity';

// Service
@Service()
export class LocalService extends EntityService<LocalUser> {
  // Attributes
  entity = LocalUser;

  // Constructor
  constructor(
    database: DatabaseService
  ) { super(database) }

  // Methods
  async create(auth0: string): Promise<LocalUser> {
    // Create user
    const user = this.repository.create({
      auth0
    });

    return await this.repository.save(user);
  }

  async list(): Promise<LocalUser[]> {
    return await this.repository.find();
  }

  async get(id: string): Promise<LocalUser> {
    // Checks
    if (!validator.isUUID(id)) throw HttpError.NotFound(`User ${id} not found`);

    // Get user
    const user = await this.repository.findOne({
      where: { id }
    });

    // Throw if not found
    if (!user) throw HttpError.NotFound(`User ${id} not found`);

    return user;
  }

  @transaction()
  async getOrCreate(auth0: string): Promise<LocalUser> {
    // Get user
    const user = await this.repository.findOne({
      where: { auth0 }
    });

    // Create if not found
    if (!user) return this.create(auth0);

    return user;
  }
}
