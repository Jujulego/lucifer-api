import { Request } from 'express';
import { Document, Types } from 'mongoose';

import { PermissionHolder } from './permission';
import Token from './token';

// Interface
interface User extends Document, PermissionHolder {
  // Attributes
  email: string;
  password: string;
  lastConnexion?: Date;
  readonly tokens: Types.DocumentArray<Token>;

  // Methods
  generateToken(req: Request): Token | Promise<Token>
}

// Types
export type Credentials = Pick<User, 'email' | 'password'>
export type UserToken = { _id: string }

export default User;
