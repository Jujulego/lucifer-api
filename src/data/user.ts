import { Request } from 'express';
import { Document, Types } from 'mongoose';

import Token from './token';

// Interface
interface User extends Document {
  // Attributes
  email: string;
  password: string;

  readonly tokens: Types.DocumentArray<Token>;

  // Methods
  generateToken(req: Request): Token | Promise<Token>
}

// Types
export type Credentials = Pick<User, 'email' | 'password'>
export type UserToken = { _id: string, date: string }

export default User;