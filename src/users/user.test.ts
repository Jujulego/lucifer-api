import validator from 'validator';

import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';

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
  let users: User[];

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);

      // Create some users
      users = await usrRepo.save([
        usrRepo.create({ id: 'tests|users-user-1' }),
        usrRepo.create({ id: 'tests|users-user-2' }),
        usrRepo.create({ id: 'tests|users-user-3' }),
        usrRepo.create({ id: 'tests|users-user-4' }),
      ]);
    });
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);

    // Delete created users
    await usrRepo.delete(users.map(usr => usr.id));
  });

  // Tests
  // - User.toJSON
  test('User.toJSON', () => {
    const user = users[0];

    expect(user.toJSON())
      .toEqual({
        id: user.id
      });
  });

  // - UserService.list
  test('UserService.list', async () => {
    const res = await service.list();
    users.forEach(usr => {
      delete usr.daemons;
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

  // - UserService.delete
  test('UserService.delete', async () => {
    const user = users[0];
    const usrRepo = database.connection.getRepository(User);

    await service.delete(user.id);

    expect(await usrRepo.findOne(user.id))
      .toBeUndefined();
  });
});
