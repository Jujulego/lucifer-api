// Environment
const env = {
  PORT: process.env.PORT || 3000,
  PRODUCTION: process.env.NODE_ENV === 'production'
};

export default env;