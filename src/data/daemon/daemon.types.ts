import { Document, Types } from 'mongoose';

import PermissionHolder from 'data/permission/permission.holder';
import TokenHolder from 'data/token/token.holder';

// Interface
export interface Daemon extends Document, PermissionHolder, TokenHolder {
  // Attributes
  name?: string;
  secret: string;
  user: Types.ObjectId;

  readonly lrn: string;
}

// Types
export type Credentials = Pick<Daemon, '_id' | 'secret'>;
export type DaemonToken = { _id: string };

export type SimpleDaemon = Omit<Daemon, 'permissions' | 'tokens'>;
export type DaemonFilter = Partial<Pick<Daemon, 'name' | 'user'>>;

export type DaemonCreate = Pick<Daemon, 'name' | 'user'>;
export type DaemonUpdate = Partial<Pick<Daemon, 'name' | 'user'>>;
