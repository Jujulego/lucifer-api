import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import supertest from 'supertest';

import { AppModule } from 'app.module';
import { Auth0UserService } from 'users/auth0.service';
import { factoryAuth0UserMock } from 'users/auth0.mock';
import { LocalUser } from 'users/local.entity';

import { login } from 'tests/utils';

import auth0Mock from 'mocks/auth0.mock.json';

// Server setup
let app: INestApplication;
let database: Connection;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(Auth0UserService).useFactory(factoryAuth0UserMock('tests|api-users'))
    .compile();

  app = module.createNestApplication();
  await app.init();

  // Start server
  request = supertest(app.getHttpServer());
  database = app.get(Connection);
});

// Disconnect
afterAll(async () => {
  await app?.close();
});

// Fill database
let users: LocalUser[];
let token: string;

beforeEach(async () => {
  await database.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);

    // Create some users
    users = await usrRepo.save([
      usrRepo.create({ id: 'tests|api-users-1', email: 'test1@users.api.com', name: 'Test 1', daemons: [] }),
      usrRepo.create({ id: 'tests|api-users-2', email: 'test2@users.api.com', name: 'Test 2', daemons: [] })
    ]);
  });

  // Get tokens
  token = await login(app, 'tests|api-users-1', ['read:users']);
});

// Empty database
afterEach(async () => {
  const usrRepo = database.getRepository(LocalUser);

  await usrRepo.delete(users.map(usr => usr.id));
});

// Tests
describe('GET /api/users/:id', () => {
  it('should return user\'s details', async () => {
    const ath = auth0Mock[0];
    const lcl = users[0];

    const rep = await request.get(`/api/users/${lcl.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
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

  it('should be forbidden (missing scope)', async () => {
    const lcl = users[0];
    token = await login(app, users[1].id, []);

    await request.get(`/api/users/${lcl.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect('Content-Type', /json/);
  });

  it('should be allowed (access own data)', async () => {
    const lcl = users[0];
    token = await login(app, lcl.id, []);

    await request.get(`/api/users/${lcl.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);
  });
});

describe('GET /api/users', () => {
  it('should return all users', async () => {
    const rep = await request.get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.arrayContaining(
      users.map(usr => expect.objectContaining({ id: usr.id }))
    ));
  });

  it('should be forbidden (missing scope)', async () => {
    token = await login(app, 'tests|api-users-1', []);

    await request.get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403)
      .expect('Content-Type', /json/);
  });
});
