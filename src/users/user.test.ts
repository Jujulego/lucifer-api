import { DIContainer, loadServices } from 'inversify.config';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';

import { LocalUser } from './local.entity';
import { UserService } from './user.service';
import { Auth0UserService } from './auth0.service';

import './auth0.mock';
import { MockAuth0UserService } from './auth0.mock';
import auth0Mock from 'mocks/auth0.mock.json';

// Tests
describe('users/user.service', () => {
  // Load services
  let database: DatabaseService;
  let service: UserService;

  beforeAll(async () => {
    loadServices();

    // Load services
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
  let users: LocalUser[];

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(LocalUser);

      // Create some users
      users = await usrRepo.save([
        usrRepo.create({ id: 'tests|users-user-1', daemons: [] }),
        usrRepo.create({ id: 'tests|users-user-2', daemons: [] })
      ]);
    });

    // Set mock data
    (DIContainer.get(Auth0UserService) as MockAuth0UserService)
      .setMockData('tests|users-user', auth0Mock);
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(LocalUser);

    // Delete created users
    await usrRepo.delete(users.map(usr => usr.id));
  });

  // Tests
  // - UserService.list
  test('UserService.list', async () => {
    const res = await service.list();

    expect(res).toEqual(
      users.map(usr => expect.objectContaining({
        id: usr.id,
        daemons: usr.daemons
      }))
    );
  });

  // - UserService.get
  test('UserService.get', async () => {
    const ath = auth0Mock[0];
    const lcl = users[0];

    const res = await service.get(lcl.id);
    expect(res).toEqual({
      id:         lcl.id,
      email:      ath.email,
      emailVerified: true,
      name:       ath.name,
      nickname:   ath.nickname,
      givenName:  ath.givenName,
      familyName: ath.familyName,
      picture:    ath.picture,
      daemons:    lcl.daemons
    });
  });

  test('UserService.get: unknown user', async () => {
    await expect(service.get('tests|000000000000'))
      .rejects.toEqual(HttpError.NotFound('User tests|000000000000 not found'));
  });
});
