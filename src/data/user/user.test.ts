import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import { User } from './user';
import UserModel from './user.model';
import UserRepository from './user.repository';

import { parseLRN } from 'utils';

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
  // - User.lrn
  test('User.lrn', () => {
    const user = users[0];
    const lrn = parseLRN(user.lrn);

    expect(lrn).not.toBeNull();
    expect(lrn!.id).toEqual(user.id);
    expect(lrn!.type).toEqual('user');
  });

  // - User.toJSON
  test('User.toJSON', () => {
    const user = users[0].toJSON();

    expect(user).toHaveProperty('_id');
    expect(user).toHaveProperty('email');
    expect(user).not.toHaveProperty('password');
  });

  // - UserRepository.create
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

  // - UserRepository.getById
  test('UserRepository.getById: existing user', async () => {
    const repo = new UserRepository();
    const user = users[0];

    const res = await repo.getById(user._id);
    expect(res).not.toBeNull();
    expect(res!._id).toEqual(user._id);
    expect(res!.email).toEqual(user.email);
    expect(res!.password).toEqual(user.password);
  });

  test('UserRepository.getById: unknown user', async () => {
    const repo = new UserRepository();

    const res = await repo.getById('deadbeefdeadbeefdeadbeef');
    expect(res).toBeNull();
  });

  // - UserRepository.getByCredentials
  test('UserRepository.getByCredentials: existing user', async () => {
    const repo = new UserRepository();
    const user = users[0];

    const res = await repo.getByCredentials({ email: 'test1@test.com', password: 'test1' });
    expect(res).not.toBeNull();
    expect(res!.email).toEqual(user.email);
    expect(res!.password).toEqual(user.password);
  });

  test('UserRepository.getByCredentials: wrong email', async () => {
    const repo = new UserRepository();

    const res = await repo.getByCredentials({ email: 'tomato@test.com', password: 'test1' });
    expect(res).toBeNull();
  });

  test('UserRepository.getByCredentials: wrong password', async () => {
    const repo = new UserRepository();

    const res = await repo.getByCredentials({ email: 'test1@test.com', password: 'tomato' });
    expect(res).toBeNull();
  });

  // - UserRepository.find
  test('UserRepository.find: empty filter', async () => {
    const repo = new UserRepository();

    const res = await repo.find({});
    expect(res).toHaveLength(4);
  });

  // - UserRepository.update
  test('UserRepository.update: change email', async () => {
    const repo = new UserRepository();
    const user = users[0];

    const res = await repo.update(user, { email: 'test@test.com' });
    expect(res._id).toEqual(user._id);
    expect(res.email).toEqual('test@test.com');
  });

  test('UserRepository.update: change to existing email', async () => {
    const repo = new UserRepository();
    const user = users[0];

    await expect(repo.update(user, { email: 'test2@test.com' })).rejects.toThrow();
  });

  test('UserRepository.update: change password', async () => {
    const repo = new UserRepository();
    const user = users[0];

    const res = await repo.update(user, { password: 'tomato' });
    expect(res._id).toEqual(user._id);
    expect(await bcrypt.compare('tomato', user.password)).toBeTruthy();
  });

  // - UserRepository.delete
  test('UserRepository.delete: existing user', async () => {
    const repo = new UserRepository();
    const user = users[0];

    const res = await repo.delete(user.id);
    expect(res).not.toBeNull();
    expect(res!._id).toEqual(user._id);

    const get = await UserModel.findById(user.id);
    expect(get).toBeNull();
  });

  test('UserRepository.delete: unknown user', async () => {
    const repo = new UserRepository();

    const res = await repo.delete('deadbeefdeadbeefdeadbeef');
    expect(res).toBeNull();
  });
});
