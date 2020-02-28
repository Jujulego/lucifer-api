import { Document } from 'mongoose';

import { PermissionHolder } from './permission';
import { TokenHolder } from './token';

// Interface
interface User extends Document, PermissionHolder, TokenHolder {
  // Attributes
  email: string;
  password: string;
}

// Types
export type Credentials = Pick<User, 'email' | 'password'>
export type UserToken = { _id: string }

export default User;
