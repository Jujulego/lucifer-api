import { Document, Types } from 'mongoose';

import { PermissionHolder } from './permission';
import { TokenHolder } from './token';

// Interface
interface Daemon extends Document, PermissionHolder, TokenHolder {
  // Attributes
  name?: string;
  secret: string;
  user: Types.ObjectId;
}

// Types
export type Credentials = Pick<Daemon, '_id' | 'secret'>;
export type DaemonToken = { _id: string };

export type SimpleDaemon = Omit<Daemon, 'permissions' | 'tokens'>;
export type DaemonFilter = Partial<Pick<Daemon, 'name' | 'user'>>;

export type DaemonCreate = Pick<Daemon, 'name' | 'user'>;
export type DaemonUpdate = Partial<Pick<Daemon, 'name' | 'user'>>;

export default Daemon;
