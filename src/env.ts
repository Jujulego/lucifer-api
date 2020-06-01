import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Check for missing vars
if (!process.env.AUTH0_DOMAIN) {
  throw new Error(`Missing AUTH0_DOMAIN variable`);
}

// Environment
export const env = {
  AUTH_STRATEGY: process.env.AUTH_STRATEGY || 'jwt',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === 'production',

  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET,

  JWT_KEY: process.env.JWT_KEY || 'superkey!',
};
