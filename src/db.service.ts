import { Connection, createConnection, EntityManager } from 'typeorm';

import { Service, EntityService as _EntityService } from 'utils';

import { LoggerService } from 'logger.service';
import { injectable } from 'inversify';

// Service
@Service({ singleton: true })
export class DatabaseService {
  // Attributes
  private _connection?: Connection;

  // Constructor
  constructor(
    private logger: LoggerService
  ) {}

  // Methods
  async connect(): Promise<void> {
    if (this._connection) return;

    try {
      // Connection
      this._connection = await createConnection();
      this.logger.info('Connected to database');
    } catch (error) {
      this.logger.error('Failed to connect to database');
      this.logger.error(error.stack);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    if (!this._connection) return;

    // Disconnect
    await this._connection.close();
    this._connection = undefined;

    this.logger.info('Disconnected from database');
  }

  // Properties
  get connection(): Connection {
    if (!this._connection) {
      throw new Error('Not yet connected to database !');
    }

    return this._connection;
  }
}

// Helper
@injectable()
export abstract class EntityService<E> extends _EntityService<E> {
  // Constructor
  protected constructor(
    protected database: DatabaseService
  ) { super() }

  // Properties
  get manager(): EntityManager {
    return this.database.connection.manager;
  }
}
