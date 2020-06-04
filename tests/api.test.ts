import supertest from 'supertest';

import { app } from 'app';
import { DatabaseService } from 'db.service';
import { DIContainer, loadServices } from 'inversify.config';

// Server setup
let database: DatabaseService;
let request: ReturnType<typeof supertest>;

// Load services
beforeAll(async () => {
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

// Tests
test('GET /api/version', async () => {
  const rep = await request.get('/api/version')
    .expect(200)
    .expect('Content-Type', /json/);

  expect(rep.body.version).toEqual(expect.any(String));
  expect(rep.body).toHaveProperty('commit');
});
