import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

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

  // Tests
  test('UserRepository.create', async () => {
    const repo = new UserRepository();
    const user = await repo.create({ email: 'test@test.com', password: 'test' });

    expect(user._id).toBeDefined();
    expect(user.email).toEqual('test@test.com');
    expect(await bcrypt.compare('test', user.password)).toBeTruthy();
  });
});
