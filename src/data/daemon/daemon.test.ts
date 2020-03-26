import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { Daemon } from './daemon';
import DaemonModel from './daemon.model';
import DaemonRepository from './daemon.repository';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { parseLRN } from 'utils';

// Tests
describe('data/daemon', () => {
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
  let user: User;
  let daemons: Daemon[] = [];

  beforeEach(async () => {
    // Create one user
    user = await (new UserModel({ email: 'test@test.com', password: 'test' })).save();

    // Create some daemons
    daemons = await Promise.all([
      new DaemonModel({ name: 'Test 1', secret: 'test1', user: user.id }).save(),
      new DaemonModel({ name: 'Test 2', secret: 'test2', user: user.id }).save(),
      new DaemonModel({ name: 'Test 3', secret: 'test3', user: user.id }).save(),
      new DaemonModel({ name: 'Test 4', secret: 'test4', user: user.id }).save(),
    ]);
  });

  // Empty database
  afterAll(async () => {
    // Delete daemons & user
    await Promise.all(daemons.map(daemon => daemon.remove()));
    await user.remove();
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });
});
