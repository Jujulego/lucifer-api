import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import env from 'env';
import UserModel from 'data/user/user.model';

import { Token } from './token';
import TokenHolder from './token.holder';

// Tests
describe('data/token', () => {
  // Connect to database
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL!, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  // Fill database
  let holder: TokenHolder;
  let token: Token;

  beforeEach(async () => {
    // Create a token holder
    holder = await (new UserModel({ email: 'test@token.com', password: 'test' })).save();

    // Create a token
    token = holder.tokens.create({ token: 'test', from: '1.2.3.4', tags: ['test'] });
    holder.tokens.push(token);
    await holder.save();
  });

  // Empty database
  afterEach(async () => {
    await holder.remove();
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
});
