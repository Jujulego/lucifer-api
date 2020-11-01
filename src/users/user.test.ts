import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { DatabaseModule } from 'database.module';
import { Daemon } from 'daemons/daemon.entity';

import { UsersModule } from './users.module';
import { LocalUser } from './local.entity';
import { LocalUserService } from './local.service';
import { UserService } from './user.service';
import { Auth0UserService } from './auth0.service';
import { factoryAuth0UserMock } from './auth0.mock';

import auth0Mock from 'mocks/auth0.mock.json';

// Load services
let app: TestingModule;
let database: Connection;
let service: UserService;

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [
      DatabaseModule,
      UsersModule,
      TypeOrmModule.forFeature([Daemon])
    ],
    providers: []
  })
    .overrideProvider(Auth0UserService).useFactory(factoryAuth0UserMock('tests|users-user'))
    .compile();

  database = app.get(Connection);
  service = app.get(UserService);
});

afterAll(async () => {
  await app?.close();
});

// Fill database
let users: LocalUser[];

beforeEach(async () => {
  await database.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);

    // Create some users
    users = await usrRepo.save([
      usrRepo.create({ id: 'tests|users-user-1', email: 'test1@user.users.com', name: 'Test 1', daemons: [] }),
    ]);
  });
});

// Empty database
afterEach(async () => {
  jest.restoreAllMocks();

  // Delete created users
  const usrRepo = database.getRepository(LocalUser);
  await usrRepo.delete(users.map(usr => usr.id));
});

// Tests
test('UserService.list', async () => {
  await expect(service.list())
    .resolves.toEqual([
      expect.objectContaining({
        id: 'tests|users-user-1'
      }),
      expect.objectContaining({
        id: 'tests|users-user-2'
      })
    ]);
});

describe('UserService.get', () => {
  it('should return a user', async () => {
    const ath = auth0Mock[0];
    const lcl = users[0];

    const res = await service.get(lcl.id);
    expect(res).toEqual({
      id:         lcl.id,
      email:      ath.email,
      name:       ath.name,
      emailVerified: true,
      nickname:   ath.nickname,
      givenName:  ath.givenName,
      familyName: ath.familyName,
      picture:    ath.picture,
      daemons:    lcl.daemons
    });
  });

  it('should throw a not found http error', async () => {
    await expect(service.get('tests|000000000000'))
      .rejects.toEqual(new NotFoundException('User tests|000000000000 not found'));
  });

  it('should fail to merge users with different ids', async () => {
    // Setup fake local user
    const lus = app.get(LocalUserService);
    const lcl = database.getRepository(LocalUser)
      .create({ id: 'tests|users-user-20', email: 'test20@user.users.com', name: 'Test 20' });

    jest.spyOn(lus, 'get')
      .mockImplementation(async () => lcl);

    // Call
    await expect(service.get('tests|users-user-1'))
      .rejects.toEqual(new InternalServerErrorException('Trying to merge tests|users-user-1 and tests|users-user-20'));
  });
});

describe('UserService.getLocal', () => {
  it('should return existing user', async () => {
    const lcl = users[0];

    // Call
    await expect(service.getLocal(lcl.id))
      .resolves.toEqual(expect.objectContaining({ id: lcl.id }));
  });

  it('should create local user', async () => {
    const usrRepo = database.getRepository(LocalUser);

    await expect(usrRepo.findOne({ id: 'tests|users-user-2' }))
      .resolves.toBeUndefined();

    // Call
    try {
      await expect(service.getLocal('tests|users-user-2'))
        .resolves.toEqual(expect.objectContaining({ id: 'tests|users-user-2' }));

    } finally {
      await usrRepo.delete('tests|users-user-2');
    }
  });

  it('should throw as the user doesn\'t exists', async () => {
    // Call
    await expect(service.getLocal('tests|users-user-30'))
      .rejects.toEqual(new NotFoundException('User tests|users-user-30 not found'));
  });
});
