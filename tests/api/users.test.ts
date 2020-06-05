import supertest from 'supertest';

import { app } from 'app';
import { DIContainer, loadServices } from 'inversify.config';
import { login } from 'tests/utils';

import { DatabaseService } from 'db.service';
import { LocalUser } from 'users/local.entity';

import 'users/auth0.mock';
import { Auth0UserMock } from 'users/auth0.mock';
import auth0Mock from 'mocks/auth0.mock.json';
import { Auth0UserService } from 'users/auth0.service';

// Server setup
let database: DatabaseService;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  // Load services
  loadServices();

  database = DIContainer.get(DatabaseService);
  await database.connect();

  // Start server
  request = supertest(app);
});

// Disconnect
afterAll(async () => {
  await database.disconnect();
});

// Fill database
let users: LocalUser[];
let token: string;

beforeEach(async () => {
  await database.connection.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);

    // Create some users
    users = await usrRepo.save([
      usrRepo.create({ id: 'tests|api-users-1', daemons: [] }),
      usrRepo.create({ id: 'tests|api-users-2', daemons: [] })
    ]);
  });

  // Get tokens
  token = await login('tests|api-users-1');

  // Set mock data
  (DIContainer.get(Auth0UserService) as Auth0UserMock)
    .setMockData('tests|api-users', auth0Mock);
});

// Empty database
afterEach(async () => {
  const usrRepo = database.connection.getRepository(LocalUser);

  await usrRepo.delete(users.map(usr => usr.id));
});

// Tests
// - get a user
test('GET /api/users/:id', async () => {
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

// - get all users
test('GET /api/users', async () => {
  const rep = await request.get('/api/users')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/);

  expect(rep.body).toEqual(expect.arrayContaining(
    users.map(usr => expect.objectContaining({ id: usr.id }))
  ));
});
