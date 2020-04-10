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
export type Credentials = { id: Daemon['_id'], secret: Daemon['secret'] };

export type SimpleDaemon = Omit<Daemon, 'permissions' | 'tokens'>;
export type DaemonFilter = Partial<Pick<Daemon, '_id' | 'name' | 'user'>>;

export type DaemonObject = Omit<Daemon, Exclude<keyof Document, '_id'>>;
export type DaemonCreate = Pick<Daemon, 'name' | 'user'>;
export type DaemonUpdate = Partial<Pick<Daemon, 'name' | 'secret' | 'user'>>;
