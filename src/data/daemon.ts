import { Document, Types } from 'mongoose';
import { omit } from 'lodash';

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

// Utils
export function simplifyDaemon(daemon: Daemon): SimpleDaemon {
  return omit(daemon, ['permissions', 'tokens']);
}

export default Daemon;
