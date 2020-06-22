import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';

import { AppModule } from 'app.module';

// Server setup
let app: INestApplication;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = module.createNestApplication();
  await app.init();

  // Start server
  request = supertest(app.getHttpServer());
});

afterAll(async () => {
  await app?.close();
});

// Tests
test('GET /api/version', async () => {
  const rep = await request.get('/api/version')
    .expect(200)
    .expect('Content-Type', /json/);

  expect(rep.body.version).toEqual(expect.any(String));
  expect(rep.body).toHaveProperty('commit');
});
