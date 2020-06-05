import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Connection } from 'typeorm';

import { AppModule } from 'app.module';

import { LocalUser } from './local.entity';
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
    imports: [AppModule],
  })
    .overrideProvider(Auth0UserService).useFactory(factoryAuth0UserMock('tests|users-user'))
    .compile();

  database = app.get(Connection);
  service = app.get(UserService);
});

afterAll(async () => {
  await app.close();
});

// Fill database
let users: LocalUser[];

beforeEach(async () => {
  await database.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);

    // Create some users
    users = await usrRepo.save([
      usrRepo.create({ id: 'tests|users-user-1', daemons: [] }),
      usrRepo.create({ id: 'tests|users-user-2', daemons: [] })
    ]);
  });
});

// Empty database
afterEach(async () => {
  const usrRepo = database.getRepository(LocalUser);

  // Delete created users
  await usrRepo.delete(users.map(usr => usr.id));
});

// Tests
test('UserService.list', async () => {
  await expect(service.list())
    .resolves.toEqual(
      users.map(usr => expect.objectContaining({
        id: usr.id,
        daemons: usr.daemons
      }))
    );
});

describe('UserService.get', () => {
  it('should return a user', async () => {
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

  it('should throw a not found http error', async () => {
    await expect(service.get('tests|000000000000'))
      .rejects.toEqual(new NotFoundException('User tests|000000000000 not found'));
  });
});
