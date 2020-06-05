import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import supertest from 'supertest';

import { AppModule } from 'app.module';
import { Daemon } from 'daemons/daemon.entity';
import { LocalUser } from 'users/local.entity';

import { login } from 'tests/utils';

// Server setup
let app: INestApplication;
let database: Connection;
let request: ReturnType<typeof supertest>;

beforeAll(async () => {
  const module = await Test.createTestingModule({
    imports: [AppModule]
  }).compile();

  app = module.createNestApplication();
  await app.init();

  // Start server
  request = supertest(app.getHttpServer());
  database = app.get(Connection);
});

afterAll(async () => {
  await app?.close();
});

// Fill database
let user: LocalUser;
let daemon: Daemon;
let token: string;

beforeEach(async () => {
  await database.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);
    const dmnRepo = manager.getRepository(Daemon);

    // Create a user
    user = await usrRepo.save(
      usrRepo.create({ id: 'tests|api-daemons-1' }),
    );

    // Create a daemon
    daemon = await dmnRepo.save(
      dmnRepo.create({ owner: user }),
    );
  });

  // Get tokens
  token = await login(app, 'tests|api-daemons-1');
});

// Empty database
afterEach(async () => {
  await database.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);
    const dmnRepo = manager.getRepository(Daemon);

    // Delete all
    await dmnRepo.delete(daemon.id);
    await usrRepo.delete(user.id);
  });
});

// Tests
// - get all daemons
test('GET /api/daemons', async () => {
  const rep = await request.get('/api/daemons')
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
    .expect('Content-Type', /json/);

  expect(rep.body).toEqual(expect.arrayContaining([
    daemon.toJSON()
  ]));
});
