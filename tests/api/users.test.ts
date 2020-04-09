import mongoose from 'mongoose';
import supertest from 'supertest';
import 'reflect-metadata';

import app from 'app';
import * as db from 'db';
import { loadServices } from 'inversify.config';
import { should } from 'utils';

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

  let token: string;

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
    token = (await userLogin({ email: 'admin@api.users.com', password: 'test' }, '1.2.3.4')).token;
    await userLogin({ email: 'self@api.users.com', password: 'test' }, '1.2.3.4');
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
  // - get all users
  test('GET /api/users', async () => {
    const rep = await request.get(`/api/users`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.arrayContaining([
      should.simpleUser({ _id: admin.id.toString() }),
      should.simpleUser({ _id: self.id.toString() }),
      should.simpleUser({ _id: user.id.toString(), lastConnexion: undefined })
    ]));
  });

  // - get a user
  test('GET /api/users/:id', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: [should.token(['Tests'])]
    }));
  });
});
