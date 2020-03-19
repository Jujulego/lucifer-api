import { Document } from 'mongoose';
import { omit } from 'lodash';

import PermissionHolder from 'data/permission/permission.holder';
import TokenHolder from 'data/token/token.holder';

// Interface
interface User extends Document, PermissionHolder, TokenHolder {
  // Attributes
  email: string;
  password: string;

  readonly lrn: string;
}

// Types
export type Credentials = Pick<User, 'email' | 'password'>
export type UserToken = { _id: string }

export type SimpleUser = Omit<User, 'permissions' | 'tokens'>;
export type UserFilter = Partial<Pick<User, 'email'>>;

export type UserCreate = Pick<User, 'email' | 'password'>;
export type UserUpdate = Partial<UserCreate>;

// Utils
export function simplifyUser(user: User): SimpleUser {
  return omit(user, ['permissions', 'tokens']);
}

export default User;
