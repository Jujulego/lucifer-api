import mongoose from 'mongoose';

import env from 'env';
import DIContainer from './inversify.config';

import { LoggerService } from 'logger.service';

// Mongoose config
mongoose.Promise = global.Promise;

// Functions
export async function connect() {
  // Get logger
  const logger = DIContainer.get(LoggerService);

  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGO_URL, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.critical(`Failed to connect to MongoDB: ${error.message} (${error.reason})`);
    process.exit(1);
  }
}
