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
test('GET /', async () => {
  await request.get('/')
    .expect(200)
    .expect('Hello World!');
});
