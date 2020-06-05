import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

import { AppModule } from 'app.module';
import { Auth0UserService } from 'users/auth0.service';
import { factoryAuth0UserMock } from 'users/auth0.mock';

import { should } from 'utils';
import { login } from 'tests/utils';

// Server setup
let app: INestApplication;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule]
  })
    .overrideProvider(Auth0UserService).useFactory(factoryAuth0UserMock('tests|api-auth'))
    .compile();

  app = module.createNestApplication();
  await app.init();

  // Start server
  request = supertest(app.getHttpServer());
});

afterAll(async () => {
  await app?.close();
});

// Fill database
let token: string;

beforeEach(async () => {
  // Get token
  token = await login(app, 'tests|api-auth-1');
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
