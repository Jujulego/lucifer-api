import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

import { AppModule } from 'app.module';

// Load app
let app: INestApplication;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  request = supertest(app.getHttpServer());
});

afterAll(async () => {
  await app.close();
});

// Tests
test('GET /api/version', async () => {
  const rep = await request.get('/api/version')
    .expect(200)
    .expect('Content-Type', /json/)
    .expect('Hello World!');

  expect(rep).toEqual({
    version: expect.any(String),
    commit: expect.any(String)
  });
});
