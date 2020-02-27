import { Request } from 'express';
import { Document, Types } from 'mongoose';

import { PermissionHolder } from './permission';
import Token from './token';

// Interface
interface Daemon extends Document, PermissionHolder {
  // Attributes
  name?: string;
  secret: string;
  lastConnexion?: Date;
  readonly tokens: Types.DocumentArray<Token>;

  // Methods
  generateToken(req: Request): Token | Promise<Token>
}

// Types
export type Credentials = Pick<Daemon, '_id' | 'secret'>;
export type DaemonToken = { _id: string };

export default Daemon;
