// Environment
export const env = {
  JWT_KEY: process.env.JWT_KEY || 'superkey!',

  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === 'production'
};
