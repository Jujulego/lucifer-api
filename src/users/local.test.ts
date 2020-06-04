import { DIContainer, loadServices } from 'inversify.config';

import { DatabaseService } from 'db.service';

import { LocalUser } from './local.entity';
import { LocalUserService } from './local.service';

// Load services
let database: DatabaseService;
let service: LocalUserService;

beforeAll(async () => {
  loadServices();

  database = DIContainer.get(DatabaseService);
  service = DIContainer.get(LocalUserService);

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
      repo.create({ id: 'tests|users-local-1', daemons: [] }),
      repo.create({ id: 'tests|users-local-2', daemons: [] }),
      repo.create({ id: 'tests|users-local-3', daemons: [] }),
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
    await expect(service.get('test'))
      .resolves.toBeNull();
  });
});

describe('LocalService.create', () => {
  it('should create new user', async () => {
    const user = await service.create('tests|users-local-10');

    try {
      expect(user).toEqual({
        id: 'tests|users-local-10',
        daemons: []
      });

    } finally {
      const repo = database.connection.getRepository(LocalUser);
      await repo.delete(user.id);
    }
  });
});

describe('LocalService.getOrCreate', () => {
  it('should create new user', async () => {
    const user = await service.getOrCreate('tests|users-local-10');

    try {
      expect(user).toEqual(expect.objectContaining({
        id: 'tests|users-local-10',
        daemons: []
      }));

    } finally {
      await service.repository.delete(user.id);
    }
  });

  it('should return existing user', async () => {
    const user = users[0];

    await expect(service.getOrCreate(user.id))
      .resolves.toEqual(user);
  });
});
