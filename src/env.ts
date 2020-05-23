import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Environment
export const env = {
  AUTH_STRATEGY: process.env.AUTH_STRATEGY || 'jwt',
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === 'production',

  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
  AUTH0_ISSUER: process.env.AUTH0_ISSUER,
  AUTH0_JWKS: process.env.AUTH0_JWKS || '',

  JWT_KEY: process.env.JWT_KEY || 'superkey!',
};
