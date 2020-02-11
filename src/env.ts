// Environment
const env = {
  JWT_KEY: process.env.JWT_KEY || 'superkey!',
  MONGODB_URL: process.env.MONGODB_URL || "mongodb://localhost:27017/lucifer",

  PORT: process.env.PORT || 8000,
  PRODUCTION: process.env.NODE_ENV === 'production'
};

export default env;