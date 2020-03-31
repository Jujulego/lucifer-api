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
  let tokenS: string;
  let tokenU: string;

  beforeEach(async () => {
    // Create some users
    [admin, self, user] = await Promise.all([
      new UserModel({
        email: 'admin@api.users.com', password: 'test',
        permissions: [
          { name: 'users', level: PLvl.ALL },
          { name: 'permissions', level: PLvl.ALL }
        ],
      }).save(),
      new UserModel({
        email: 'self@api.users.com', password: 'test', admin: false,
        permissions: [{ name: 'daemons', level: PLvl.READ }],
      }).save(),
      new UserModel({
        email: 'user@api.users.com', password: 'test', admin: false
      }).save(),
    ]);

    // Get tokens
    tokenA = (await userLogin({ email: 'admin@api.users.com', password: 'test' }, '1.2.3.4')).token;
    tokenS = (await userLogin({ email: 'self@api.users.com', password: 'test' }, '1.2.3.4')).token;
    tokenU = (await userLogin({ email: 'user@api.users.com', password: 'test' }, '1.2.3.4')).token;
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
  test('GET /api/user/:id', async () => {
    const rep = await request.get(`/api/user/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body._id).toEqual(self.id.toString());
  });

  test('GET /api/user/:id (as self)', async () => {
    const rep = await request.get(`/api/user/${self.id}`)
      .set('Authorization', `Bearer ${tokenS}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body._id).toEqual(self.id.toString());
  });

  test('GET /api/user/:id (as user)', async () => {
    const rep = await request.get(`/api/user/${self.id}`)
      .set('Authorization', `Bearer ${tokenU}`)
      .expect(403)
      .expect('Content-Type', /json/);

    expect(rep.body).toRespect({ code: 403, error: 'Not allowed' });
  });

  test('GET /api/user/:id (not connected)', async () => {
    const rep = await request.get(`/api/user/${self.id}`)
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body).toRespect({ code: 401, error: expect.any(String) });
  });
});
