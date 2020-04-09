import mongoose from 'mongoose';
import supertest from 'supertest';
import 'reflect-metadata';

import app from 'app';
import * as db from 'db';
import { loadServices } from 'inversify.config';

import { PLvl } from 'data/permission/permission.enums';
import UserModel from 'data/user/user.model';
import { User } from 'data/user/user';

import { userLogin } from '../utils';

// Tests
describe('api/users', () => {
  // Server setup
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    loadServices();
    await db.connect();

    request = supertest(app);
  });

  // Fill database
  let admin: User;
  let self: User;
  let user: User;

  let tokenA: string;
  let tokenU: string;

  beforeEach(async () => {
    // Create some users
    [admin, self, user] = await Promise.all([
      new UserModel({
        email: 'admin@api.auth.com', password: 'test',
        permissions: [
          { name: 'users', level: PLvl.ALL },
          { name: 'permissions', level: PLvl.ALL }
        ],
      }).save(),
      new UserModel({
        email: 'self@api.auth.com', password: 'test', admin: false,
        permissions: [{ name: 'daemons', level: PLvl.READ }],
      }).save(),
      new UserModel({
        email: 'user@api.auth.com', password: 'test', admin: false
      }).save(),
    ]);

    // Get tokens
    tokenA = (await userLogin({ email: 'admin@api.auth.com', password: 'test' }, '1.2.3.4')).token;
    tokenU = (await userLogin({ email: 'user@api.auth.com', password: 'test' }, '1.2.3.4')).token;
  });

  // Empty database
  afterEach(async () => {
    await Promise.all([
      admin.remove(),
      self.remove(),
      user.remove(),
    ])
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - get a user
  test('GET /api/users/:id', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body._id).toEqual(self.id.toString());
  });

  test('GET /api/users/:id (not connected)', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body).toRespect({ code: 401, error: expect.any(String) });
  });
});
