import mongoose from 'mongoose';

import env from 'env';

// Mongoose config
mongoose.Promise = global.Promise;

// Functions
export async function connect() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGO_URL, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(`Failed to connect to MongoDB: ${error.message} (${error.reason})`);
    process.exit(1);
  }
}
