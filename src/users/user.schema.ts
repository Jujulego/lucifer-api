import joi from '@hapi/joi';

// Types
export interface UpdateUser {
  name?:  string;
  email?: string;
}

// Schema
export const updateSchema = joi.object({
  name: joi.string(),
  email: joi.string().email()
});
