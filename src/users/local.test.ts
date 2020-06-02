import validator from 'validator';

import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

import { DatabaseService } from 'db.service';

import { LocalUser } from './local.entity';
import { LocalService } from './local.service';
import { HttpError } from 'utils/errors';

// Load services
let database: DatabaseService;
let service: LocalService;

beforeAll(async () => {
  loadServices();

  database = DIContainer.get(DatabaseService);
  service = DIContainer.get(LocalService);

  // Connect to databse
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});

// Add some data
let users: LocalUser[];

beforeEach(async () => {
  await database.connection.transaction(async manager => {
    const repo = manager.getRepository(LocalUser);

    users = await repo.save([
      repo.create({ auth0: 'tests|users-local-1' }),
      repo.create({ auth0: 'tests|users-local-2' }),
      repo.create({ auth0: 'tests|users-local-3' }),
      repo.create({ auth0: 'tests|users-local-4' }),
    ]);
  });
});

afterEach(async () => {
  const repo = database.connection.getRepository(LocalUser);
  await repo.delete(users.map(usr => usr.id));
});

// Tests
test('LocalService.list', async () => {
  await expect(service.list())
    .resolves.toEqual(expect.arrayContaining(users));
});

describe('LocalService.get', () => {
  it('should return user', async () => {
    const user = users[0];

    await expect(service.get(user.id))
      .resolves.toEqual(user);
  });

  it('should throw not found error', async () => {
    // Invalid uuid
    await expect(service.get('uuid'))
      .rejects.toEqual(HttpError.NotFound('User uuid not found'));

    // Invalid uuid
    await expect(service.get('00000000-0000-0000-0000-000000000000'))
      .rejects.toEqual(HttpError.NotFound('User 00000000-0000-0000-0000-000000000000 not found'));
  });
});

describe('LocalService.create', () => {
  it('should create new user', async () => {
    const user = await service.create('tests|users-local-10');

    try {
      expect(user).toEqual(expect.objectContaining({
        id: should.validate(validator.isUUID),
        auth0: 'tests|users-local-10'
      }));

    } finally {
      const repo = database.connection.getRepository(LocalUser);
      await repo.delete(user.id);
    }
  });

  it('should fail to create existing user', async () => {
    const user = users[0];

    await expect(service.create(user.auth0))
      .rejects.toBeDefined();
  });
});

describe('LocalService.getOrCreate', () => {
  it('should create new user', async () => {
    const user = await service.getOrCreate('tests|users-local-10');

    try {
      expect(user).toEqual(expect.objectContaining({
        id: should.validate(validator.isUUID),
        auth0: 'tests|users-local-10'
      }));

    } finally {
      await service.repository.delete(user.id);
    }
  });

  it('should return existing user', async () => {
    const user = users[0];

    await expect(service.getOrCreate(user.auth0))
      .resolves.toEqual(user);
  });
});
