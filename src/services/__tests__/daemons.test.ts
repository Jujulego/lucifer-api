import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';

import { TestContext } from 'bases/context';
import { HttpError } from 'middlewares/errors';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { Daemon } from 'data/daemon/daemon';
import DaemonModel from 'data/daemon/daemon.model';
import { PLvl } from 'data/permission/permission.enums';

import DaemonsService from '../daemons.service';

// Tests
describe('services/daemons.service', () => {
  // Connect to database & load services
  beforeAll(async () => {
    await db.connect();
    loadServices();
  });

  // Fill database
  let user: User;
  let owner: User;
  let admin: User;
  let daemon: Daemon;

  beforeEach(async () => {
    // Create some users
    [admin, owner, user] = await Promise.all([
      new UserModel({
        email: 'admin@daemons.com', password: 'test',
        permissions: [{ name: 'daemons', level: PLvl.ALL }]
      }).save(),
      new UserModel({
        email: 'owner@daemons.com', password: 'test', admin: false
      }).save(),
      new UserModel({
        email: 'user@daemons.com', password: 'test', admin: false
      }).save(),
    ]);

    // Create some daemons
    [, daemon] = await Promise.all([
      new DaemonModel({ user: admin.id, secret: 'admin' }).save(),
      new DaemonModel({
        user: owner.id, secret: 'owner',
        tokens: [{ token: 'roar !' }]
      }).save(),
    ]);
  });

  // Empty database
  afterEach(async () => {
    await Promise.all([
      admin.remove(),
      owner.remove(),
      user.remove(),
      daemon.remove()
    ]);
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - DaemonsService.create
  test('DaemonsService.create', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const daemon = await service.create(ctx, { name: 'Test', user: owner.id });

    try {
      expect(daemon._id).toBeDefined();
      expect(daemon.name).toEqual('Test');
      expect(daemon.secret).toHaveLength(42);
      expect(daemon.user).toEqual(owner._id);

      expect(DaemonModel.findById(daemon._id)).not.toBeNull();
    } finally {
      await DaemonModel.findByIdAndDelete(daemon._id);
    }
  });

  test('DaemonsService.create: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.create(ctx, { name: 'Test', user: owner.id })
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });

  // - DaemonsService.createToken
  test('DaemonsService.createToken', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const token = await service.createToken(ctx, daemon.id, ['Test']);
    expect(token.token).toBeDefined();
    expect(token.from).toEqual('1.2.3.4');
    expect(token.tags).toEqual(['Test']);
  });

  test('DaemonsService.createToken: by owner', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    const token = await service.createToken(ctx, daemon.id, ['Test']);
    expect(token.token).toBeDefined();
    expect(token.from).toEqual('1.2.3.4');
    expect(token.tags).toEqual(['Test']);
  });

  test('DaemonsService.createToken: by daemon', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    const token = await service.createToken(ctx, daemon.id, ['Test']);
    expect(token.token).toBeDefined();
    expect(token.from).toEqual('1.2.3.4');
    expect(token.tags).toEqual(['Test']);
  });

  test('DaemonsService.createToken: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.createToken(ctx, daemon.id, ['Test'])
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });

  // - DaemonsService.get
  test('DaemonsService.get', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.get(ctx, daemon.id);
    expect(res.id).toEqual(daemon.id);
  });

  test('DaemonsService.get: by owner', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    const res = await service.get(ctx, daemon.id);
    expect(res.id).toEqual(daemon.id);
  });

  test('DaemonsService.get: by daemon', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    const res = await service.get(ctx, daemon.id);
    expect(res.id).toEqual(daemon.id);
  });

  test('DaemonsService.get: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.get(ctx, daemon.id)
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });

  // - DaemonsService.find
  test('DaemonsService.find', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.find(ctx);
    expect(res).not.toHaveLength(0);
  });

  test('DaemonsService.find: by owner', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    const res = await service.find(ctx);
    expect(res).toHaveLength(1);
  });

  test('DaemonsService.find: by daemon', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    const res = await service.find(ctx);
    expect(res).toHaveLength(1);
  });

  test('DaemonsService.find: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    const res = await service.find(ctx);
    expect(res).toHaveLength(0);
  });

  // - DaemonsService.update
  test('DaemonsService.update', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.update(ctx, daemon.id, { name: 'Tomato' });
    expect(res.id).toEqual(daemon.id);
    expect(res.name).toEqual('Tomato');
  });

  test('DaemonsService.update: by owner', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    const res = await service.update(ctx, daemon.id, { name: 'Tomato' });
    expect(res.id).toEqual(daemon.id);
    expect(res.name).toEqual('Tomato');
  });

  test('DaemonsService.update: by daemon', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    const res = await service.update(ctx, daemon.id, { name: 'Tomato' });
    expect(res.id).toEqual(daemon.id);
    expect(res.name).toEqual('Tomato');
  });

  test('DaemonsService.update: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.update(ctx, daemon.id, { name: 'Tomato' })
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });

  // - DaemonsService.regenerateSecret
  test('DaemonsService.regenerateSecret', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.regenerateSecret(ctx, daemon.id);
    expect(res._id).toEqual(daemon._id);
    expect(res.tokens).toHaveLength(0);
  });

  test('DaemonsService.regenerateSecret: by owner', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    const res = await service.regenerateSecret(ctx, daemon.id);
    expect(res._id).toEqual(daemon._id);
    expect(res.tokens).toHaveLength(0);
  });

  test('DaemonsService.regenerateSecret: by daemon', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    const res = await service.regenerateSecret(ctx, daemon.id);
    expect(res._id).toEqual(daemon._id);
    expect(res.tokens).toHaveLength(0);
  });

  test('DaemonsService.regenerateSecret: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.regenerateSecret(ctx, daemon.id)
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });
});
