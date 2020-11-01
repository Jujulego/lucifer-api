import joi from 'joi';

// Schema
export const envSchema = joi.object({
  DATABASE_URL: joi.string()
    .optional(),

  PORT: joi.number()
    .port().default(8000),

  AUTH0_DOMAIN: joi.string()
    .domain().required(),

  AUTH0_AUDIENCE: joi.string()
    .required(),

  AUTH0_CLIENT_ID: joi.string()
    .required(),

  AUTH0_CLIENT_SECRET: joi.string()
    .required()
});
