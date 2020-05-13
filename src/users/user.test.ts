import validator from 'validator';

import { TestContext } from 'context/test.context';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { Role } from 'roles/role.entity';

import { Token } from './token.entity';
import { User } from './user.entity';
import { UserService } from './user.service';

// Tests
describe('users/user.service', () => {
  // Load services
  let database: DatabaseService;
  let service: UserService;

  beforeAll(async () => {
    // Load services
    loadServices();

    database = DIContainer.get(DatabaseService);
    service = DIContainer.get(UserService);

    // Connect to database
    await database.connect();
  });

  afterAll(async () => {
    // Disconnect from database
    await database.disconnect();
  });

  // Fill database
  let admin: User;
  let users: User[];
  let token: Token;

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const rolRepo = manager.getRepository(Role);
      const usrRepo = manager.getRepository(User);
      const tknRepo = manager.getRepository(Token);

      // Create a admin
      admin = await usrRepo.save(
        usrRepo.create({
          role: rolRepo.create({ create: true, read: true, write: true, delete: true }),
          email: 'admin@user.com',
          password: 'admin'
        })
      );

      // Create some users
      users = await usrRepo.save([
        usrRepo.create({ role: rolRepo.create(), email: 'test1@user.com', password: 'test1', tokens: [] }),
        usrRepo.create({ role: rolRepo.create(), email: 'test2@user.com', password: 'test2', tokens: [] }),
        usrRepo.create({ role: rolRepo.create(), email: 'test3@user.com', password: 'test3', tokens: [] }),
        usrRepo.create({ role: rolRepo.create(), email: 'test4@user.com', password: 'test4', tokens: [] }),
      ]);

      // Create a token
      token = await tknRepo.save(tknRepo.create({ user: users[0], tags: ['test'] }));

      users[0].tokens!.push(token);
      delete token.user;
    });
  });

  // Empty database
  afterEach(async () => {
    const rolRepo = database.connection.getRepository(Role);

    // Delete created users
    await rolRepo.delete(users.map(usr => usr.id));
    await rolRepo.delete(admin.id);
  });

  // Tests
  // - User.lrn
  test('User.lrn', () => {
    const user = users[0];

    expect(user.lrn.id).toEqual(user.id);
    expect(user.lrn.resource).toEqual('user');
    expect(user.lrn.parent).toBeUndefined();
  });

  // - User.toJSON
  test('User.toJSON', () => {
    const user = users[0];

    expect(user.toJSON())
      .toEqual({
        id: user.id,
        lrn: user.lrn.toString(),
        email: user.email,
        tokens: [token.toJSON()]
      });
  });

  // - UserService.create
  test('UserService.create: new user', async () => {
    const user = await service.create({ email: 'test@user.com', password: 'test' });

    try {
      expect(user)
        .toEqual(expect.objectContaining({
          id: should.validate(validator.isUUID),
          email: 'test@user.com',
          password: should.hashOf('test'),

          daemons: [],
          tokens: []
        }));

    } finally {
      const usrRepo = database.connection.getRepository(User);
      await usrRepo.delete(user.id);
    }
  });

  test('UserService.create: email case', async () => {
    const user = await service.create({ email: 'TeST@uSEr.coM', password: 'test' });

    try {
      expect(user.email).toEqual('test@user.com');

    } finally {
      const usrRepo = database.connection.getRepository(User);
      await usrRepo.delete(user.id);
    }
  });

  test('UserService.create: existing user', async () => {
    await expect(service.create({ email: 'test1@user.com', password: 'test1' }))
      .rejects.toThrow();
  });

  test('UserService.create: invalid data', async () => {
    // Empty email
    await expect(service.create({ email: '', password: 'test' }))
      .rejects.toEqual(HttpError.BadRequest('"email" is not allowed to be empty'));

    // Invalid email
    await expect(service.create({ email: 'test', password: 'test' }))
      .rejects.toEqual(HttpError.BadRequest('"email" must be a valid email'));

    // Empty password
    await expect(service.create({ email: 'test@test.com', password: '' }))
      .rejects.toEqual(HttpError.BadRequest('"password" is not allowed to be empty'));
  });

  // - UserService.list
  test('UserService.list', async () => {
    const res = await service.list();
    users.forEach(usr => {
      delete usr.daemons;
      delete usr.tokens;
      usr.role = { id: usr.id, name: null, create: false, read: false, write: false, delete: false } as unknown as Role;
    });

    expect(res).toEqual(expect.arrayContaining(users));
  });

  // - UserService.get
  test('UserService.get: full user', async () => {
    const user = users[0];

    const res = await service.get(user.id);
    expect(res).toEqual(user);
  });

  test('UserService.get: simple user', async () => {
    const user = users[0];

    const res = await service.get(user.id, { full: false });

    delete user.daemons;
    delete user.tokens;
    delete user.role;
    expect(res).toEqual(user);
  });

  test('UserService.get: invalid uuid', async () => {
    await expect(service.get('uuid'))
      .rejects.toEqual(HttpError.NotFound());
  });

  test('UserService.get: unknown user', async () => {
    await expect(service.get('00000000-0000-0000-0000-000000000000'))
      .rejects.toEqual(HttpError.NotFound('User 00000000-0000-0000-0000-000000000000 not found'));
  });

  // - UserService.update
  test('UserService.update: change email', async () => {
    const user = users[0];

    expect(await service.update(user.id, { email: 'test@user.com' }))
      .toEqual(expect.objectContaining({
        id: user.id,
        email: 'test@user.com'
      }));
  });

  test('UserService.update: change to existing email', async () => {
    const user = users[0];

    await expect(service.update(user.id, { email: 'test2@user.com' }))
      .rejects.toThrow();
  });

  test('UserService.update: change password', async () => {
    const user = users[0];

    expect(await service.update(user.id, { password: 'tomato' }))
      .toEqual(expect.objectContaining({
        id: user.id,
        password: should.hashOf('tomato'),
        tokens: []
      }));
  });

  test('UserService.update: invalid data', async () => {
    const user = users[0];

    // Empty email
    await expect(service.update(user.id, { email: '' }))
      .rejects.toEqual(HttpError.BadRequest('"email" is not allowed to be empty'));

    // Invalid email
    await expect(service.update(user.id, { email: 'test' }))
      .rejects.toEqual(HttpError.BadRequest('"email" must be a valid email'));

    // Empty password
    await expect(service.update(user.id, { password: '' }))
      .rejects.toEqual(HttpError.BadRequest('"password" is not allowed to be empty'));
  });

  // - UserService.delete
  test('UserService.delete', async () => {
    const usrRepo = database.connection.getRepository(User);
    const ctx = new TestContext({}, admin);
    const user = users[0];

    await service.delete(ctx, user.id);

    expect(await usrRepo.findOne(user.id))
      .toBeUndefined();
  });
});
