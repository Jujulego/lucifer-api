import { Logger } from '@nestjs/common';
import dotenv from 'dotenv';

import { envSchema } from 'env.schema';

// Load .env file
dotenv.config();

// Validate env
const { error, value } = envSchema.validate(process.env, { allowUnknown: true });

if (error) {
  if (process.env.NODE_ENV === 'test') {
    console.error(error.message);
  } else {
    const logger = new Logger('Configuration')
    logger.error(error.message);
  }

  process.exit(1);
}

// Environment
export const env = {
  AUTH_STRATEGY: value.AUTH_STRATEGY,
  LOG_LEVEL:     value.LOG_LEVEL || 'debug',
  PORT:          value.PORT!,
  PRODUCTION:    value.NODE_ENV === 'production',
  TESTS:         value.NODE_ENV === 'test',

  AUTH0_DOMAIN:        value.AUTH0_DOMAIN!,
  AUTH0_AUDIENCE:      value.AUTH0_AUDIENCE!,
  AUTH0_CLIENT_ID:     value.AUTH0_CLIENT_ID!,
  AUTH0_CLIENT_SECRET: value.AUTH0_CLIENT_SECRET!
};

