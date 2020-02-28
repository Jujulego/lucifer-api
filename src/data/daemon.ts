import { Document } from 'mongoose';

import { PermissionHolder } from './permission';
import { TokenHolder } from './token';

// Interface
interface Daemon extends Document, PermissionHolder, TokenHolder {
  // Attributes
  name?: string;
  secret: string;
}

// Types
export type Credentials = Pick<Daemon, '_id' | 'secret'>;
export type DaemonToken = { _id: string };

export default Daemon;
