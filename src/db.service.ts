import { Connection, createConnection } from 'typeorm';

import { Service } from 'utils';

import { LoggerService } from 'logger.service';

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

    // Connection
    this._connection = await createConnection();
    this.logger.info('Connected to database');
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