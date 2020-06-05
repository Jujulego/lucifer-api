import dotenv from 'dotenv';

// Constants
const STRATEGIES = ['auth0', 'jwt']

// Load .env file
dotenv.config();

// Check for missing vars
if (!process.env.AUTH0_DOMAIN)        throw new Error('Missing AUTH0_DOMAIN variable');
if (!process.env.AUTH0_CLIENT_ID)     throw new Error('Missing AUTH0_CLIENT_ID variable');
if (!process.env.AUTH0_CLIENT_SECRET) throw new Error('Missing AUTH0_CLIENT_SECRET variable');

if (process.env.AUTH_STRATEGY && STRATEGIES.indexOf(process.env.AUTH_STRATEGY) === -1) {
  throw new Error(`Invalid AUTH_STRATEGY: unknown strategy ${process.env.AUTH_STRATEGY}`);
}

// Environment
export const env = {
  AUTH_STRATEGY: process.env.AUTH_STRATEGY || 'auth0',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === 'production',
  TESTS: process.env.NODE_ENV === 'test',

  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET
};
