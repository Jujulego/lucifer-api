import validator from 'validator';

import { HttpError } from 'middlewares/errors';
import { Service } from 'utils';

import { DatabaseService } from 'db.service';
import { UserService } from 'users/user.service';

import { Daemon } from './daemon.entity';

// Types
export type DaemonCreate = { ownerId?: string };
export type DaemonUpdate = { ownerId?: string };

// Service
@Service(DaemonService)
export class DaemonService {
  // Constructor
  constructor(
    private database: DatabaseService,
    private users: UserService
  ) {}

  // Methods
  async create(data: DaemonCreate): Promise<Daemon> {
    const repo = this.repository;

    // Validate data
    if (data.ownerId && !validator.isUUID(data.ownerId)) throw HttpError.BadRequest('Invalid value for ownerId');

    try {
      // Create daemon
      const daemon = repo.create();

      if (data.ownerId) {
        daemon.owner = await this.users.get(data.ownerId, { full: false });
      }

      return await repo.save(daemon);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.code === 404) throw HttpError.BadRequest(error.message);
      }

      throw error;
    }
  }

  async list(): Promise<Daemon[]> {
    return this.repository.find({
      relations: ['owner']
    });
  }

  async get(id: string): Promise<Daemon> {
    if (!validator.isUUID(id)) throw HttpError.NotFound();

    // Get daemon
    const daemon = await this.repository.findOne(id, {
      relations: ['owner']
    });

    if (!daemon) throw HttpError.NotFound(`Daemon ${id} not found`);

    return daemon;
  }

  async update(id: string, update: DaemonUpdate): Promise<Daemon> {
    // Get daemon
    const daemon = await this.get(id);

    // Validate data
    if (update.ownerId && !validator.isUUID(update.ownerId)) throw HttpError.BadRequest('Invalid value for ownerId');

    try {
      // Apply update
      if (update.ownerId) {
        daemon.owner = await this.users.get(update.ownerId, { full: false });
      }

      return await this.repository.save(daemon);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.code === 404) throw HttpError.BadRequest(error.message);
      }

      throw error;
    }
  }

  async delete(id: string) {
    await this.repository.delete(id);
  }

  // Properties
  get repository() {
    return this.database.connection.getRepository(Daemon);
  }
}
