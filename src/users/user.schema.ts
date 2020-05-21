import joi from '@hapi/joi';

import { User } from './user.entity';

// Types
export type UserCreate = Pick<User, 'email' | 'password'>;
export type UserUpdate = Partial<Pick<User, 'email' | 'password'>>;

// Schema
export const userCreate = joi.object({
  email:    joi.string().required().max(128).email().lowercase(),
  password: joi.string().required().max(128)
});

export const userUpdate = joi.object({
  email:    joi.string().max(128).email().lowercase(),
  password: joi.string().max(128)
});
