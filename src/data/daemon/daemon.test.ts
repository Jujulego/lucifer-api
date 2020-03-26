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
  let user1: User;
  let user2: User;
  let daemons: Daemon[] = [];

  beforeEach(async () => {
    // Create users
    [user1, user2] = await Promise.all([
      new UserModel({ email: 'test1@test.com', password: 'test' }).save(),
      new UserModel({ email: 'test2@test.com', password: 'test' }).save(),
    ]);

    // Create some daemons
    daemons = await Promise.all([
      new DaemonModel({ name: 'Test 1', secret: 'test1', user: user1.id }).save(),
      new DaemonModel({ name: 'Test 2', secret: 'test2', user: user1.id }).save(),
      new DaemonModel({ name: 'Test 3', secret: 'test3', user: user2.id }).save(),
      new DaemonModel({ name: 'Test 4', secret: 'test4', user: user2.id }).save(),
    ]);
  });

  // Empty database
  afterEach(async () => {
    // Delete daemons & user
    await Promise.all(daemons.map(daemon => daemon.remove()));
    await Promise.all([user1.remove(), user2.remove()]);
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
    const daemon = await repo.create({ name: 'Test', user: user1.id }, 'test');

    expect(daemon._id).toBeDefined();
    expect(daemon.name).toEqual('Test');
    expect(daemon.user).toEqual(user1._id);
    expect(await bcrypt.compare('test', daemon.secret)).toBeTruthy();

    // Delete created daemon
    await daemon.remove();
  });

  test('DaemonRepository.create: unnamed daemon', async () => {
    const repo = new DaemonRepository();
    const daemon = await repo.create({ user: user1.id }, 'test');

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

    const res = await repo.getByUser(daemon._id, user1.id);
    expect(res).not.toBeNull();
    expect(res!._id).toEqual(daemon._id);
    expect(res!.user).toEqual(user1._id);
  });

  test('DaemonRepository.getByUser: wrong user', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.getByUser(daemon._id, 'deadbeefdeadbeefdeadbeef');
    expect(res).toBeNull();
  });

  // - DaemonRepository.find
  test('DaemonRepository.find: empty filter', async () => {
    const repo = new DaemonRepository();

    const res = await repo.find({});
    expect(res).toHaveLength(4);
    expect(res.map(d => d._id)).toEqual(daemons.map(d => d._id));
  });

  // - DaemonRepository.update
  test('DaemonRepository.update: change fields', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.update(daemon, { name: 'Tomato', user: user2._id });
    expect(res._id).toEqual(daemon._id);
    expect(res.name).toEqual('Tomato');
    expect(res.user).toEqual(user2._id);
  });

  test('DaemonRepository.update: change secret', async () => {
    const repo = new DaemonRepository();
    const daemon = daemons[0];

    const res = await repo.update(daemon, { secret: 'tomato' });
    expect(res._id).toEqual(daemon._id);
    expect(await bcrypt.compare('tomato', daemon.secret)).toBeTruthy();
  });

  // -
});
