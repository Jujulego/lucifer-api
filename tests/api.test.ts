import mongoose from 'mongoose';
import supertest from 'supertest';
import 'reflect-metadata';

import app from 'app';
import * as db from 'db';
import { loadServices } from 'inversify.config';

// Tests
describe('api', () => {
  // Server setup
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    loadServices();
    await db.connect();

    request = supertest(app);
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  test('/api/version', async () => {
    const rep = await request.get('/api/version')
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body.version).toEqual(expect.any(String));
    expect(rep.body).toHaveProperty('commit');
  });
});
