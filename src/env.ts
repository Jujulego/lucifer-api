import { Logger } from '@nestjs/common';
import dotenv from 'dotenv';

import { envSchema } from 'env.schema';

// Load .env file
dotenv.config();

// Validate env
const result = envSchema.validate(process.env, { allowUnknown: true });

if (result.error) {
  const logger = new Logger('Configuration')
  logger.error(result.error.message);
  process.exit(1);
}

// Environment
export const env = {
  AUTH_STRATEGY: process.env.AUTH_STRATEGY,
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT!,
  PRODUCTION: process.env.NODE_ENV === 'production',
  TESTS: process.env.NODE_ENV === 'test',

  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN!,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE!,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID!,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET!
};

