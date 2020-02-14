import mongoose from "mongoose";

import env from 'env';

// Mongoose config
mongoose.Promise = global.Promise;

// Functions
export async function connect() {
  // Connect to MongoDB
  await mongoose.connect(env.MONGODB_URL, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  console.log("Connected to MongoDB");
}