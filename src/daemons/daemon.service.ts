import { DatabaseService } from 'db.service';
import { Service } from 'utils';

import { Daemon } from './daemon.entity';
import { HttpError } from 'middlewares/errors';
import validator from 'validator';

// Service
@Service(DaemonService)
export class DaemonService {
  // Constructor
  constructor(
    private database: DatabaseService
  ) {}

  // Methods
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

  // Properties
  get repository() {
    return this.database.connection.getRepository(Daemon);
  }
}
