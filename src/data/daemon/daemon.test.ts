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
  afterEach(async () => {
    // Delete daemons & user
    await Promise.all(daemons.map(daemon => daemon.remove()));
    await user.remove();
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - Daemon.lrn
  test('Daemon.lrn', () => {
    const daemon = daemons[0];
    const lrn = parseLRN(daemon.lrn);

    expect(lrn).not.toBeNull();
    expect(lrn!.id).toEqual(daemon.id);
    expect(lrn!.type).toEqual('daemon');
  });

  // - Daemon.toJSON
  test('Daemon.toJSON', () => {
    const daemon = daemons[0].toJSON();

    expect(daemon).toHaveProperty('_id');
    expect(daemon).toHaveProperty('name');
    expect(daemon).not.toHaveProperty('secret');
    expect(daemon).toHaveProperty('user');
  });

  // - DaemonRepository
  test('DaemonRepository.create: named daemon', async () => {
    const repo = new DaemonRepository();
    const daemon = await repo.create({ name: 'Test', user: user.id }, 'test');

    expect(daemon._id).toBeDefined();
    expect(daemon.name).toEqual('Test');
    expect(daemon.user).toEqual(user._id);
    expect(await bcrypt.compare('test', daemon.secret)).toBeTruthy();

    // Delete created daemon
    await daemon.remove();
  });

  test('DaemonRepository.create: unnamed daemon', async () => {
    const repo = new DaemonRepository();
    const daemon = await repo.create({ user: user.id }, 'test');

    expect(daemon._id).toBeDefined();
    expect(daemon.name).toBeUndefined();

    // Delete created daemon
    await daemon.remove();
  });

  // - DaemonRepository.getById
  test('DaemonRepository.getById: existing daemon', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.getById(daemon._id);
    expect(res).not.toBeNull();
    expect(res!._id).toEqual(daemon._id);
    expect(res!.name).toEqual(daemon.name);
    expect(res!.secret).toEqual(daemon.secret);
    expect(res!.user).toEqual(daemon.user);
  });

  test('DaemonRepository.getById: unknown daemon', async () => {
    const repo = new DaemonRepository();

    const res = await repo.getById('deadbeefdeadbeefdeadbeef');
    expect(res).toBeNull();
  });

  // - DaemonRepository.getByCredentials
  test('DaemonRepository.getByCredentials: existing daemon', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.getByCredentials({ id: daemon._id, secret: 'test1' });
    expect(res).not.toBeNull();
    expect(res!._id).toEqual(daemon._id);
    expect(res!.secret).toEqual(daemon.secret);
  });

  test('DaemonRepository.getByCredentials: wrong id', async () => {
    const repo = new DaemonRepository();

    const res = await repo.getByCredentials({ id: 'deadbeefdeadbeefdeadbeef', secret: 'test1' });
    expect(res).toBeNull();
  });

  test('DaemonRepository.getByCredentials: wrong secret', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.getByCredentials({ id: daemon.id, secret: 'tomato' });
    expect(res).toBeNull();
  });

  // - DaemonRepository.getByUser
  test('DaemonRepository.getByuser: existing daemon', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.getByUser(daemon._id, user.id);
    expect(res).not.toBeNull();
    expect(res!._id).toEqual(daemon._id);
    expect(res!.user).toEqual(user._id);
  });

  test('DaemonRepository.getByUser: wrong user', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.getByUser(daemon._id, 'deadbeefdeadbeefdeadbeef');
    expect(res).toBeNull();
  });
});
