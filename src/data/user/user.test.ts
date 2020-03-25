import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { User } from './user';
import UserModel from './user.model';
import UserRepository from './user.repository';

// Tests
describe('data/user', () => {
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
  let users: User[] = [];

  beforeEach(async () => {
    // Create some users
    users = await Promise.all([
      new UserModel({ email: 'test1@test.com', password: 'test1' }).save(),
      new UserModel({ email: 'test2@test.com', password: 'test2' }).save(),
      new UserModel({ email: 'test3@test.com', password: 'test3' }).save(),
      new UserModel({ email: 'test4@test.com', password: 'test4' }).save(),
    ]);
  });

  // Empty database
  afterEach(async () => {
    // Delete created users
    await Promise.all(users.map(user => user.remove()));
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  test('UserRepository.create: new user', async () => {
    const repo = new UserRepository();
    const user = await repo.create({ email: 'test@test.com', password: 'test' });

    expect(user._id).toBeDefined();
    expect(user.email).toEqual('test@test.com');
    expect(await bcrypt.compare('test', user.password)).toBeTruthy();

    // Delete created user
    await user.remove();
  });

  test('UserRepository.create: email case', async () => {
    const repo = new UserRepository();
    const user = await repo.create({ email: 'TeST@tESt.coM', password: 'test' });

    expect(user._id).toBeDefined();
    expect(user.email).toEqual('test@test.com');
    expect(await bcrypt.compare('test', user.password)).toBeTruthy();

    // Delete created user
    await user.remove();
  });

  test('UserRepository.create: existing user', async () => {
    const repo = new UserRepository();

    await expect(repo.create({ email: 'test1@test.com', password: 'test1' })).rejects.toThrow();
  });
});
