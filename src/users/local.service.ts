import { Service, transaction } from 'utils';

import { DatabaseService, EntityService } from 'db.service';

import { LocalUser } from './local.entity';

// Service
@Service()
export class LocalUserService extends EntityService<LocalUser> {
  // Attributes
  entity = LocalUser;

  // Constructor
  constructor(
    database: DatabaseService
  ) { super(database) }

  // Methods
  async create(id: string): Promise<LocalUser> {
    // Create user
    const user = this.repository.create({ id });
    user.daemons = [];

    return await this.repository.save(user);
  }

  async list(): Promise<LocalUser[]> {
    return await this.repository.find({
      relations: ['daemons'],
      order: { id: 'ASC' }
    });
  }

  async get(id: string): Promise<LocalUser | null> {
    // Get user
    const user = await this.repository.findOne({
      relations: ['daemons'],
      where: { id }
    });

    return user || null;
  }

  @transaction()
  async getOrCreate(id: string): Promise<LocalUser> {
    // Get user
    const user = await this.get(id);

    // Create if not found
    if (!user) return this.create(id);

    return user;
  }
}
