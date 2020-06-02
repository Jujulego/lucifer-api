import { Repository } from 'typeorm';
import validator from 'validator';

import { Service } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { UserService } from 'users/user.service';

import { Daemon } from './daemon.entity';
import { daemonCreate, DaemonCreate } from './daemon.schema';
import { daemonUpdate, DaemonUpdate } from './daemon.schema';

// Service
@Service()
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
    const result = daemonCreate.validate(data);
    if (result.error) throw HttpError.BadRequest(result.error.message);

    data = result.value;

    try {
      // Create daemon
      const daemon = repo.create();

      if (data.ownerId) {
        daemon.owner = await this.users.get(data.ownerId);
      }

      return await repo.save(daemon);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 404) throw HttpError.BadRequest(error.message);
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
    const result = daemonUpdate.validate(update);
    if (result.error) throw HttpError.BadRequest(result.error.message);

    update = result.value;

    try {
      // Apply update
      if ('ownerId' in update) {
        if (!update.ownerId) {
          daemon.owner = undefined;
        } else {
          daemon.owner = await this.users.get(update.ownerId);
        }
      }

      return await this.repository.save(daemon);
    } catch (error) {
      if (error instanceof HttpError) {
        if (error.status === 404) throw HttpError.BadRequest(error.message);
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  // Properties
  get repository(): Repository<Daemon> {
    return this.database.connection.getRepository(Daemon);
  }
}
