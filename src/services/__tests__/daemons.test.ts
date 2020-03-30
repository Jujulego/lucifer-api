import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';
import { shouldBeNotAllowed, shouldBeNotFound } from 'utils/tests';

import Context, { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { Daemon } from 'data/daemon/daemon';
import DaemonModel from 'data/daemon/daemon.model';
import { PLvl } from 'data/permission/permission.enums';
import PermissionRepository from 'data/permission/permission.repository';

import DaemonsService from '../daemons.service';

// Tests
describe('services/daemons.service', () => {
  // Connect to database & load services
  let service: DaemonsService;

  beforeAll(async () => {
    await db.connect();
    loadServices();

    service = DIContainer.get(DaemonsService);
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
        permissions: [
          { name: 'daemons', level: PLvl.ALL },
          { name: 'permissions', level: PLvl.ALL }
        ]
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
        tokens: [{ token: 'roar !' }],
        permissions: [{ name: 'users', level: PLvl.READ }]
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
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const daemon = await service.create(ctx, { name: 'Test', user: owner.id });

    expect(daemon._id).toBeDefined();
    expect(daemon.name).toEqual('Test');
    expect(daemon.secret).toHaveLength(42);
    expect(daemon.user).toEqual(owner._id);

    expect(DaemonModel.findById(daemon._id)).not.toBeNull();
  });

  test('DaemonsService.create: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await shouldBeNotAllowed(service.create(ctx, { name: 'Test', user: owner.id }));
  });

  // - DaemonsService.createToken
  async function testCreateToken(ctx: Context) {
    const token = await service.createToken(ctx, daemon.id, ['Test']);

    expect(token.token).toBeDefined();
    expect(token.from).toEqual('1.2.3.4');
    expect(token.tags).toEqual(['Test']);
  }

  test('DaemonsService.createToken', async () => {
    await testCreateToken(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('DaemonsService.createToken: by owner', async () => {
    await testCreateToken(TestContext.withUser(owner, '1.2.3.4'));
  });

  test('DaemonsService.createToken: by daemon', async () => {
    await testCreateToken(TestContext.withDaemon(daemon, '1.2.3.4'));
  });

  test('DaemonsService.createToken: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await shouldBeNotAllowed(service.createToken(ctx, daemon.id, ['Test']));
  });

  test('DaemonsService.createToken: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await shouldBeNotFound(service.createToken(ctx, 'deadbeefdeadbeefdeadbeef', ['Test']));
  });

  // - DaemonsService.get
  test('DaemonsService.get', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.get(ctx, daemon.id);
    expect(res.id).toEqual(daemon.id);
  });

  test('DaemonsService.get: by owner', async () => {
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    const res = await service.get(ctx, daemon.id);
    expect(res.id).toEqual(daemon.id);
  });

  test('DaemonsService.get: by daemon', async () => {
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    const res = await service.get(ctx, daemon.id);
    expect(res.id).toEqual(daemon.id);
  });

  test('DaemonsService.get: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await shouldBeNotAllowed(service.get(ctx, daemon.id));
  });

  test('DaemonsService.get: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await shouldBeNotFound(service.get(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - DaemonsService.find
  test('DaemonsService.find', async () => {
    await expect(service.find(TestContext.withUser(admin, '1.2.3.4')))
      .resolves.not.toHaveLength(0);
  });

  test('DaemonsService.find: by owner', async () => {
    await expect(service.find(TestContext.withUser(owner, '1.2.3.4')))
      .resolves.toHaveLength(1);
  });

  test('DaemonsService.find: by daemon', async () => {
    await expect(service.find(TestContext.withDaemon(daemon, '1.2.3.4')))
      .resolves.toHaveLength(1);
  });

  test('DaemonsService.find: by user', async () => {
    await expect(service.find(TestContext.withUser(user, '1.2.3.4')))
      .resolves.toHaveLength(0);
  });

  // - DaemonsService.update
  async function testUpdate(ctx: Context) {
    const res = await service.update(ctx, daemon.id, { name: 'Tomato' });

    expect(res.id).toEqual(daemon.id);
    expect(res.name).toEqual('Tomato');
  }

  test('DaemonsService.update', async () => {
    await testUpdate(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('DaemonsService.update: by owner', async () => {
    await testUpdate(TestContext.withUser(owner, '1.2.3.4'));
  });

  test('DaemonsService.update: by daemon', async () => {
    await testUpdate(TestContext.withDaemon(daemon, '1.2.3.4'));
  });

  test('DaemonsService.update: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await shouldBeNotAllowed(service.update(ctx, daemon.id, { name: 'Tomato' }));
  });

  test('DaemonsService.update: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await shouldBeNotFound(service.update(ctx, 'deadbeefdeadbeefdeadbeef', { name: 'Tomato' }));
  });

  // - DaemonsService.regenerateSecret
  async function testRegenerateSecret(ctx: Context) {
    const res = await service.regenerateSecret(ctx, daemon.id);

    expect(res._id).toEqual(daemon._id);
    expect(res.secret).not.toEqual(daemon.secret);
    expect(res.tokens).toHaveLength(0);
  }

  test('DaemonsService.regenerateSecret', async () => {
    await testRegenerateSecret(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('DaemonsService.regenerateSecret: by owner', async () => {
    await testRegenerateSecret(TestContext.withUser(owner, '1.2.3.4'));
  });

  test('DaemonsService.regenerateSecret: by daemon', async () => {
    await testRegenerateSecret(TestContext.withDaemon(daemon, '1.2.3.4'));
  });

  test('DaemonsService.regenerateSecret: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await shouldBeNotAllowed(service.regenerateSecret(ctx, daemon.id));
  });

  test('DaemonsService.regenerateSecret: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await shouldBeNotFound(service.regenerateSecret(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - DaemonsService.grant
  async function testGrant(ctx: Context) {
    const res = await service.grant(ctx, daemon.id, 'daemons', PLvl.READ);
    expect(res.id).toEqual(daemon.id);

    const repo = new PermissionRepository(res);
    const perm = repo.getByName('daemons');
    expect(perm).not.toBeNull();
    expect(perm!.name).toEqual('daemons');
    expect(perm!.level).toEqual(PLvl.READ);
  }

  test('DaemonsService.grant', async () => {
    await testGrant(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('DaemonsService.grant: by owner', async () => {
    const ctx = TestContext.withUser(owner, '1.2.3.4');
    await shouldBeNotAllowed(service.grant(ctx, daemon.id, 'daemons', PLvl.READ));
  });

  test('DaemonsService.grant: by daemon', async () => {
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');
    await shouldBeNotAllowed(service.grant(ctx, daemon.id, 'daemons', PLvl.READ));
  });

  test('DaemonsService.grant: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await shouldBeNotAllowed(service.grant(ctx, daemon.id, 'daemons', PLvl.READ));
  });

  test('DaemonsService.grant: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await shouldBeNotFound(service.grant(ctx, 'deadbeefdeadbeefdeadbeef', 'daemons', PLvl.READ));
  });
});
