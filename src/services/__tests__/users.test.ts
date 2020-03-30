import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';
import should from 'utils/should';

import Context, { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { PLvl } from 'data/permission/permission.enums';
import PermissionRepository from 'data/permission/permission.repository';
import { Token } from 'data/token/token';
import TokenRepository from 'data/token/token.repository';

import UsersService from '../users.service';

// Tests
describe('services/users.service', () => {
  // Connect to database & load services
  let service: UsersService;

  beforeAll(async () => {
    await db.connect();
    loadServices();

    service = DIContainer.get(UsersService);
  });

  // Fill database
  let admin: User;
  let self: User;
  let user: User;
  let atoken: Token;
  let stoken: Token;

  beforeEach(async () => {
    // Create some users
    [admin, self, user] = await Promise.all([
      new UserModel({
        email: 'admin@users.com', password: 'test',
        permissions: [
          { name: 'users', level: PLvl.ALL },
          { name: 'permissions', level: PLvl.ALL }
        ],
        tokens: [{ token: 'bark !' }],
      }).save(),
      new UserModel({
        email: 'self@users.com', password: 'test', admin: false,
        permissions: [{ name: 'daemons', level: PLvl.READ }],
        tokens: [{ token: 'roar !' }],
      }).save(),
      new UserModel({
        email: 'user@users.com', password: 'test', admin: false
      }).save(),
    ]);

    // Get token
    atoken = admin.tokens[0];
    stoken = self.tokens[0];
  });

  // Empty database
  afterEach(async () => {
    await Promise.all([
      admin.remove(),
      self.remove(),
      user.remove()
    ]);
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - UsersService.create
  test('UsersService.create', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const test = await service.create(ctx, { email: 'test@users.com', password: 'test' });
    expect(test).toRespect({
      _id: should.objectId(),
      email: 'test@users.com',
      password: should.hashOf('test')
    });

    expect(await UserModel.findById(test._id)).not.toBeNull();
  });

  test('UsersService.create: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.create(ctx, { email: 'test@users.com', password: 'test' }));
  });

  // - UsersService.createToken
  async function testCreateToken(ctx: Context) {
    expect(await service.createToken(ctx, self.id, ['Test']))
      .toRespect({
        token: expect.any(String),
        from: '1.2.3.4',
        tags: ['Test']
      });
  }

  test('UsersService.createToken', async () => {
    await testCreateToken(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('UsersService.createToken: by self', async () => {
    await testCreateToken(TestContext.withUser(self, '1.2.3.4'));
  });

  test('UsersService.createToken: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.createToken(ctx, self.id, ['Test']));
  });

  test('UsersService.createToken: unknown user', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.createToken(ctx, 'deadbeefdeadbeefdeadbeef', ['Test']));
  });

  // - UsersService.get
  test('UsersService.get', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    expect(await service.get(ctx, self.id))
      .toRespect({ id: self.id });
  });

  test('UsersService.get: by self', async () => {
    const ctx = TestContext.withUser(self, '1.2.3.4');

    expect(await service.get(ctx, self.id))
      .toRespect({ id: self.id });
  });

  test('UsersService.get: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.get(ctx, self.id));
  });

  test('UsersService.get: unknown user', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.get(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - UsersService.find
  test('UsersService.find', async () => {
    expect(await service.find(TestContext.withUser(admin, '1.2.3.4')))
      .not.toHaveLength(0);
  });

  test('UsersService.find: by user', async () => {
    expect(await service.find(TestContext.withUser(user, '1.2.3.4')))
      .toHaveLength(1);
  });

  // - UsersService.update
  async function testUpdate(ctx: Context) {
    expect(await service.update(ctx, self.id, { email: 'tomato@users.com' }))
      .toRespect({
        id: self.id,
        email: 'tomato@users.com'
      });
  }

  test('UsersService.update', async () => {
    await testUpdate(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('UsersService.update: by self', async () => {
    await testUpdate(TestContext.withUser(self, '1.2.3.4'));
  });

  test('UsersService.update: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.update(ctx, self.id, { email: 'tomato@users.com' }));
  });

  test('UsersService.update: password', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4', atoken);
    expect(await service.update(ctx, self.id, { password: 'tomato' }))
      .toRespect({
        id: self.id,
        password: should.hashOf('tomato'),
        tokens: should.haveLength(0)
      });
  });

  test('UsersService.update: password by self', async () => {
    const ctx = TestContext.withUser(self, '1.2.3.4', stoken);
    expect(await service.update(ctx, self.id, { password: 'tomato' }))
      .toRespect({
        id: self.id,
        password: should.hashOf('tomato'),
        tokens: should.haveLength(1)
      });
  });

  test('UsersService.update: unknown user', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.update(ctx, 'deadbeefdeadbeefdeadbeef', { email: 'tomato@users.com' }));
  });

  // - UsersService.grant
  test('UsersService.grant', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.grant(ctx, self.id, 'permissions', PLvl.READ);
    expect(res.id).toEqual(self.id);

    const repo = new PermissionRepository(res);
    expect(repo.getByName('permissions'))
      .toRespect({
        _id: should.objectId(),
        name: 'permissions',
        level: PLvl.READ
      });
  });

  test('UsersService.grant: by self', async () => {
    const ctx = TestContext.withUser(self, '1.2.3.4');
    await should.not.beAllowed(service.grant(ctx, self.id, 'permissions', PLvl.READ));
  });

  test('UsersService.grant: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.grant(ctx, self.id, 'permissions', PLvl.READ));
  });

  test('UsersService.grant: unknown user', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.grant(ctx, 'deadbeefdeadbeefdeadbeef', 'permissions', PLvl.READ));
  });

  // - UsersService.revoke
  test('UsersService.revoke', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const res = await service.revoke(ctx, self.id, 'daemons');
    expect(res.id).toEqual(self.id);

    const repo = new PermissionRepository(res);
    expect(repo.getByName('daemons')).toBeNull();
  });

  test('UsersService.revoke: by self', async () => {
    const ctx = TestContext.withUser(self, '1.2.3.4');
    await should.not.beAllowed(service.revoke(ctx, self.id, 'daemons'));
  });

  test('UsersService.revoke: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.revoke(ctx, self.id, 'daemons'));
  });

  test('UsersService.revoke: unknown user', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.revoke(ctx, 'deadbeefdeadbeefdeadbeef', 'daemons'));
  });

  // - UsersService.deleteToken
  async function testDeleteToken(ctx: Context) {
    expect(await service.deleteToken(ctx, self.id, stoken.id))
      .toRespect({
        tokens: should.haveLength(0)
      });
  }

  test('UsersService.deleteToken', async () => {
    await testDeleteToken(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('UsersService.deleteToken: by self', async () => {
    await testDeleteToken(TestContext.withUser(self, '1.2.3.4'));
  });

  test('UsersService.deleteToken: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.deleteToken(ctx, self.id, stoken.id));
  });

  test('UsersService.deleteToken: unknown user', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.deleteToken(ctx, 'deadbeefdeadbeefdeadbeef', stoken.id));
  });

  // - UsersService.delete
  async function testDelete(ctx: Context) {
    expect(await service.delete(ctx, self.id))
      .toRespect({ _id: self._id });

    expect(await UserModel.findById(self.id)).toBeNull();
  }

  test('UsersService.delete', async () => {
    await testDelete(TestContext.withUser(admin, '1.2.3.4'));
  });

  test('UsersService.delete: by self', async () => {
    await testDelete(TestContext.withUser(self, '1.2.3.4'));
  });

  test('UsersService.delete: by user', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.delete(ctx, self.id));
  });

  test('UsersService.delete: unknown self', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await should.not.beFound(service.delete(ctx, 'deadbeefdeadbeefdeadbeef'));
  });

  // - UsersService.login
  test('UsersService.login', async () => {
    const ctx = TestContext.notConnected('1.2.3.4');
    const tk = await service.login(ctx, { email: 'self@users.com', password: 'test' });

    expect(tk).toRespect({
      _id: should.objectId(),
      token: expect.any(String),
      user: self.id
    });

    const get = await UserModel.findById(self.id);
    const repo = new TokenRepository(get!);
    expect(repo.getById(tk._id)).not.toBeNull();
  });

  test('UsersService.login: wrong email', async () => {
    const ctx = TestContext.notConnected('1.2.3.4');
    await should.beUnauthorized(service.login(ctx, { email: 'tomato@users.com', password: 'test' }));
  });

  test('UsersService.login: wrong secret', async () => {
    const ctx = TestContext.notConnected('1.2.3.4');
    await should.beUnauthorized(service.login(ctx, { email: 'self@users.com', password: 'tomato' }));
  });

  // - UsersService.getByToken
  test('UsersService.getByToken', async () => {
    expect(await service.getByToken(self.id, 'roar !'))
      .toRespect({ _id: self._id });
  });

  test('UsersService.getByToken: wrong id', async () => {
    await should.beUnauthorized(service.getByToken('deadbeefdeadbeefdeadbeef', 'roar !'));
  });

  test('UsersService.getByToken: wrong token', async () => {
    await should.beUnauthorized(service.getByToken(self.id, 'tomato'));
  });
});
