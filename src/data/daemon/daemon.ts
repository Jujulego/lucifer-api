import { Document, Types } from 'mongoose';

import PermissionHolder from 'data/permission/permission.holder';
import TokenHolder from 'data/token/token.holder';
import { Token } from '../token/token';

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
export type DaemonFilter = Partial<Pick<Daemon, 'name' | 'user'>>;

export type DaemonObject = Omit<Daemon, keyof Document | 'tokens'> & { tokens: Token[] };
export type DaemonCreate = Pick<DaemonObject, 'name' | 'user'>;
export type DaemonUpdate = Partial<Pick<DaemonObject, 'name' | 'secret' | 'user'>>;
