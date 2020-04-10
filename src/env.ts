// Environment
const env = {
  JWT_KEY: process.env.JWT_KEY || 'superkey!',
  MONGO_URL: process.env.MONGO_URL || "mongodb://localhost:27017/lucifer",

  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === 'production'
};

export default env;
