import { DatabaseService } from 'db.service';
import { Service } from 'utils';

import { Daemon } from './daemon.entity';

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

  // Properties
  get repository() {
    return this.database.connection.getRepository(Daemon);
  }
}
