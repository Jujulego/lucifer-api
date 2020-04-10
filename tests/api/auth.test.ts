import mongoose from 'mongoose';
import supertest from 'supertest';
import 'reflect-metadata';

import app from 'app';
import * as db from 'db';
import { loadServices } from 'inversify.config';

import UserModel from 'data/user/user.model';
import { User } from 'data/user/user';

import { userLogin } from '../utils';
import { should } from '../../src/utils';
import validator from 'validator';

// Tests
describe('api/auth', () => {
  // Server setup
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    loadServices();
    await db.connect();

    request = supertest(app);
  });

  // Fill database
  let admin: User;
  let token: string;

  beforeEach(async () => {
    // Create some users
    [admin] = await Promise.all([
      new UserModel({
        email: 'admin@api.auth.com', password: 'test',
        admin: true,
      }).save(),
    ]);

    // Get tokens
    token = (await userLogin({ email: 'admin@api.auth.com', password: 'test' }, '1.2.3.4')).token;
  });

  // Empty database
  afterEach(async () => {
    await Promise.all([
      admin.remove(),
    ])
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - user login
  test('POST /api/users/login', async () => {
    const rep = await request.post('/api/users/login')
      .send({ email: 'admin@api.auth.com', password: 'test', tags: ['Tests'] })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      _id: should.objectId(),
      token: should.validate(validator.isJWT),
      user: admin.id.toString()
    });
  });

  test('POST /api/users/login (wrong credentials)', async () => {
    const rep = await request.post('/api/users/login')
      .send({ email: 'wrong@api.auth.com', password: 'test', tags: ['Tests'] })
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({ code: 401, error: expect.any(String) });
  });

  test('POST /api/users/login (invalid email)', async () => {
    const rep = await request.post('/api/users/login')
      .send({ email: 'wrong', password: 'test', tags: ['Tests'] })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({ code: 400, error: expect.any(String) });
  });

  test('POST /api/users/login (missing credentials)', async () => {
    const rep = await request.post('/api/users/login')
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({ code: 400, error: expect.any(String) });
  });

  // - connexion check
  test('GET /api/users/:id (connected)', async () => {
    await request.get(`/api/users/${admin.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);
  });

  test('GET /api/users/:id (not connected)', async () => {
    const rep = await request.get(`/api/users/${admin.id}`)
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({ code: 401, error: expect.any(String) });
  });
});
