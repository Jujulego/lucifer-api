import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'typeorm';

import { AppModule } from 'app.module';

import { LocalUser } from './local.entity';
import { LocalUserService } from './local.service';

// Load services
let app: TestingModule;
let database: Connection;
let service: LocalUserService;

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  database = app.get(Connection);
  service = app.get(LocalUserService);
});

afterAll(async () => {
  await app.close();
});

// Add some data
let users: LocalUser[];

beforeEach(async () => {
  await database.transaction(async manager => {
    const repo = manager.getRepository(LocalUser);

    users = await repo.save([
      repo.create({ id: 'tests|users-local-1', daemons: [] }),
      repo.create({ id: 'tests|users-local-2', daemons: [] }),
      repo.create({ id: 'tests|users-local-3', daemons: [] }),
    ]);
  });
});

afterEach(async () => {
  const repo = database.getRepository(LocalUser);
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
      const repo = database.getRepository(LocalUser);
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
      const repo = database.getRepository(LocalUser);
      await repo.delete(user.id);
    }
  });

  it('should return existing user', async () => {
    const user = users[0];

    await expect(service.getOrCreate(user.id))
      .resolves.toEqual(user);
  });
});
