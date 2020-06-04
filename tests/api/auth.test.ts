import supertest from 'supertest';

import { app } from 'app';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';
import { login } from 'tests/utils';

import { DatabaseService } from 'db.service';
import { Auth0UserService } from 'users/auth0.service';

import 'users/auth0.mock';
import { MockAuth0UserService } from 'users/auth0.mock';
import auth0Mock from 'mocks/auth0.mock.json';

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
let token: string;

beforeEach(async () => {
  // Get tokens
  token = await login('tests|api-auth-1');

  // Set mock data
  (DIContainer.get(Auth0UserService) as MockAuth0UserService)
    .setMockData('tests|api-auth', auth0Mock);
});

// Tests
it('should return 200', async () => {
  await request.get('/api/users/tests|api-auth-1')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/);
});

it('should return 401', async () => {
  const rep = await request.get('/api/users/tests|api-auth-1')
    .expect(401)
    .expect('Content-Type', /json/);

  expect(rep.body)
    .toEqual(should.be.unauthorized());
});
