import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { DatabaseModule } from 'database.module';
import { Daemon } from 'daemons/daemon.entity';

import { LocalUser, RequiredFields } from './local.entity';
import { LocalUserService } from './local.service';

// Load services
let app: TestingModule;
let database: Connection;
let service: LocalUserService;

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [
      DatabaseModule,
      TypeOrmModule.forFeature([Daemon, LocalUser])
    ],
    providers: [LocalUserService]
  }).compile();

  database = app.get(Connection);
  service = app.get(LocalUserService);
});

afterAll(async () => {
  await app?.close();
});

// Add some data
let users: LocalUser[];

beforeEach(async () => {
  await database.transaction(async manager => {
    const repo = manager.getRepository(LocalUser);

    users = await repo.save([
      repo.create({ id: 'tests|users-local-1', email: 'test1@local.users.com', name: 'Test 1', daemons: [] }),
      repo.create({ id: 'tests|users-local-2', email: 'test2@local.users.com', name: 'Test 2', daemons: [] }),
      repo.create({ id: 'tests|users-local-3', email: 'test3@local.users.com', name: 'Test 3', daemons: [] }),
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
  const data = {
    id: 'tests|users-local-10',
    email: 'test10@local.users.com',
    name: 'Test 10'
  };

  it('should create new user', async () => {
    const user = await service.create(data);

    try {
      expect(user).toEqual({
        id:    data.id,
        email: data.email,
        name:  data.name,
        daemons: []
      });

    } finally {
      const repo = database.getRepository(LocalUser);
      await repo.delete(user.id);
    }
  });
});

describe('LocalService.getOrCreate', () => {
  let createSpy: jest.SpyInstance<Promise<LocalUser>, [RequiredFields]>;
  const data = {
    id: 'tests|users-local-20',
    email: 'test20@local.users.com',
    name: 'Test 20'
  };

  // Mocks
  beforeEach(() => {
    createSpy = jest.spyOn(service, 'create');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Tests
  it('should create new user', async () => {
    const user = await service.getOrCreate(data.id, data);

    try {
      expect(user).toEqual(expect.objectContaining({
        id:    data.id,
        email: data.email,
        name:  data.name,
        daemons: []
      }));

      expect(createSpy).toHaveBeenCalledTimes(1);

    } finally {
      const repo = database.getRepository(LocalUser);
      await repo.delete(user.id);
    }
  });

  it('should return existing user', async () => {
    const user = users[0];

    await expect(service.getOrCreate(user.id, user))
      .resolves.toEqual(user);

    expect(createSpy).toHaveBeenCalledTimes(0);
  });
});
