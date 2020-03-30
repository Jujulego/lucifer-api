import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';
import should from 'utils/should';

import Context, { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { Daemon } from 'data/daemon/daemon';
import DaemonModel from 'data/daemon/daemon.model';
import { PLvl } from 'data/permission/permission.enums';
import PermissionRepository from 'data/permission/permission.repository';
import { Token } from 'data/token/token';
import TokenRepository from 'data/token/token.repository';

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
  let token: Token;

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

    token = daemon.tokens[0];
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
    expect(daemon)
      .toEqual(expect.objectContaining({
        _id: should.objectId(),
        name: 'Test',
        secret: should.haveLength(42),
        user: owner._id
      }));

    expect(await DaemonModel.findById(daemon._id)).not.toBeNull();
  });

  test('DaemonsService.create: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.create(ctx, { name: 'Test', user: owner.id }));
  });

  // - DaemonsService.createToken
  async function testCreateToken(ctx: Context) {
    expect(await service.createToken(ctx, daemon.id, ['Test']))
      .toEqual(expect.objectContaining({
        token: expect.any(String),
        from: '1.2.3.4',
        tags: ['Test']
      }));
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
    await should.not.beAllowed(service.createToken(ctx, daemon.id, ['Test']));
  });

  test('DaemonsService.createToken: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.createToken(ctx, 'deadbeefdeadbeefdeadbeef', ['Test']));
  });

  // - DaemonsService.get
  test('DaemonsService.get', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    expect(await service.get(ctx, daemon.id))
      .toEqual(expect.objectContaining({ id: daemon.id }));
  });

  test('DaemonsService.get: by owner', async () => {
    const ctx = TestContext.withUser(owner, '1.2.3.4');

    expect(await service.get(ctx, daemon.id))
      .toEqual(expect.objectContaining({ id: daemon.id }));
  });

  test('DaemonsService.get: by daemon', async () => {
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');

    expect(await service.get(ctx, daemon.id))
      .toEqual(expect.objectContaining({ id: daemon.id }));
  });

  test('DaemonsService.get: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.get(ctx, daemon.id));
  });

  test('DaemonsService.get: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.get(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - DaemonsService.find
  test('DaemonsService.find', async () => {
    expect(await service.find(TestContext.withUser(admin, '1.2.3.4')))
      .not.toHaveLength(0);
  });

  test('DaemonsService.find: by owner', async () => {
    expect(await service.find(TestContext.withUser(owner, '1.2.3.4')))
      .toHaveLength(1);
  });

  test('DaemonsService.find: by daemon', async () => {
    expect(await service.find(TestContext.withDaemon(daemon, '1.2.3.4')))
      .toHaveLength(1);
  });

  test('DaemonsService.find: by user', async () => {
    expect(await service.find(TestContext.withUser(user, '1.2.3.4')))
      .toHaveLength(0);
  });

  // - DaemonsService.update
  async function testUpdate(ctx: Context) {
    expect(await service.update(ctx, daemon.id, { name: 'Tomato' }))
      .toEqual(expect.objectContaining({
        id: daemon.id,
        name: 'Tomato'
      }));
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
    await should.not.beAllowed(service.update(ctx, daemon.id, { name: 'Tomato' }));
  });

  test('DaemonsService.update: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.update(ctx, 'deadbeefdeadbeefdeadbeef', { name: 'Tomato' }));
  });

  // - DaemonsService.regenerateSecret
  async function testRegenerateSecret(ctx: Context) {
    expect(await service.regenerateSecret(ctx, daemon.id))
      .toEqual(expect.objectContaining({
        _id: daemon._id,
        secret: should.all(should.not.hashTo(daemon.secret), should.haveLength(42)),
        tokens: []
      }));
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
    await should.not.beAllowed(service.regenerateSecret(ctx, daemon.id));
  });

  test('DaemonsService.regenerateSecret: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.regenerateSecret(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - DaemonsService.grant
  test('DaemonsService.grant', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.grant(ctx, daemon.id, 'daemons', PLvl.READ);
    expect(res.id).toEqual(daemon.id);

    const repo = new PermissionRepository(res);
    expect(repo.getByName('daemons'))
      .toEqual(expect.objectContaining({
        _id: should.objectId(),
        name: 'daemons',
        level: PLvl.READ
      }));
  });

  test('DaemonsService.grant: by owner', async () => {
    const ctx = TestContext.withUser(owner, '1.2.3.4');
    await should.not.beAllowed(service.grant(ctx, daemon.id, 'daemons', PLvl.READ));
  });

  test('DaemonsService.grant: by daemon', async () => {
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');
    await should.not.beAllowed(service.grant(ctx, daemon.id, 'daemons', PLvl.READ));
  });

  test('DaemonsService.grant: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.grant(ctx, daemon.id, 'daemons', PLvl.READ));
  });

  test('DaemonsService.grant: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.grant(ctx, 'deadbeefdeadbeefdeadbeef', 'daemons', PLvl.READ));
  });

  // - DaemonsService.revoke
  test('DaemonsService.revoke', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.revoke(ctx, daemon.id, 'users');
    expect(res.id).toEqual(daemon.id);

    const repo = new PermissionRepository(res);
    expect(repo.getByName('users')).toBeNull();
  });

  test('DaemonsService.revoke: by owner', async () => {
    const ctx = TestContext.withUser(owner, '1.2.3.4');
    await should.not.beAllowed(service.revoke(ctx, daemon.id, 'users'));
  });

  test('DaemonsService.revoke: by daemon', async () => {
    const ctx = TestContext.withDaemon(daemon, '1.2.3.4');
    await should.not.beAllowed(service.revoke(ctx, daemon.id, 'users'));
  });

  test('DaemonsService.revoke: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.revoke(ctx, daemon.id, 'users'));
  });

  test('DaemonsService.revoke: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.revoke(ctx, 'deadbeefdeadbeefdeadbeef', 'users'));
  });

  // - DaemonsService.deleteToken
  async function testDeleteToken(ctx: Context) {
    expect(await service.deleteToken(ctx, daemon.id, token.id))
      .toEqual(expect.objectContaining({
        tokens: should.haveLength(0)
      }));
  }

  test('DaemonsService.deleteToken', async () => {
    await testDeleteToken(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('DaemonsService.deleteToken: by owner', async () => {
    await testDeleteToken(TestContext.withUser(owner, '1.2.3.4'));
  });

  test('DaemonsService.deleteToken: by daemon', async () => {
    await testDeleteToken(TestContext.withDaemon(daemon, '1.2.3.4'));
  });

  test('DaemonsService.deleteToken: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.deleteToken(ctx, daemon.id, token.id));
  });

  test('DaemonsService.deleteToken: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.deleteToken(ctx, 'deadbeefdeadbeefdeadbeef', token.id));
  });

  // - DaemonsService.delete
  async function testDelete(ctx: Context) {
    expect(await service.delete(ctx, daemon.id))
      .toEqual(expect.objectContaining({
        _id: daemon._id
      }));

    expect(await DaemonModel.findById(daemon.id)).toBeNull();
  }

  test('DaemonsService.delete', async () => {
    await testDelete(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('DaemonsService.delete: by owner', async () => {
    await testDelete(TestContext.withUser(owner, '1.2.3.4'));
  });

  test('DaemonsService.delete: by daemon', async () => {
    await testDelete(TestContext.withDaemon(daemon, '1.2.3.4'));
  });

  test('DaemonsService.delete: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.delete(ctx, daemon.id));
  });

  test('DaemonsService.delete: unknown daemon', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.delete(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - DaemonsService.login
  test('DaemonsService.login', async () => {
    const ctx = TestContext.notConnected('1.2.3.4');
    const tk = await service.login(ctx, { id: daemon.id, secret: 'owner' }, ['Test']);

    expect(tk)
      .toEqual(expect.objectContaining({
        _id: should.objectId(),
        token: expect.any(String),
        daemon: daemon.id
      }));

    const get = await DaemonModel.findById(daemon.id);
    const repo = new TokenRepository(get!);
    expect(repo.getById(tk._id)).not.toBeNull();
  });

  test('DaemonsService.login: wrong id', async () => {
    const ctx = TestContext.notConnected('1.2.3.4');
    await should.beUnauthorized(service.login(ctx, { id: 'deadbeefdeadbeefdeadbeef', secret: 'owner' }));
  });

  test('DaemonsService.login: wrong secret', async () => {
    const ctx = TestContext.notConnected('1.2.3.4');
    await should.beUnauthorized(service.login(ctx, { id: daemon.id, secret: 'tomato' }));
  });

  // - DaemonsService.getByToken
  test('DaemonsService.getByToken', async () => {
    expect(await service.getByToken(daemon.id, 'roar !'))
      .toEqual(expect.objectContaining({
        _id: daemon._id
      }));
  });

  test('DaemonsService.getByToken: wrong id', async () => {
    await should.beUnauthorized(service.getByToken('deadbeefdeadbeefdeadbeef', 'roar !'));
  });

  test('DaemonsService.getByToken: wrong token', async () => {
    await should.beUnauthorized(service.getByToken( daemon.id, 'tomato'));
  });
});
