import mongoose from 'mongoose';
import supertest from 'supertest';
import validator from 'validator';
import 'reflect-metadata';

import app from 'app';
import * as db from 'db';
import { loadServices } from 'inversify.config';
import { should } from 'utils';

import { PLvl } from 'data/permission/permission.enums';
import UserModel from 'data/user/user.model';
import { User } from 'data/user/user';
import { LoginToken } from 'services/users.service';

import { login } from '../utils';

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
  let tokenS: LoginToken;

  beforeEach(async () => {
    // Create some users
    [admin, self, user] = await Promise.all([
      new UserModel({
        email: 'admin@api.users.com', password: 'test',
        admin: true,
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
    tokenA = (await login({ email: 'admin@api.users.com', password: 'test' }, '1.2.3.4')).token;
    tokenS = await login({ email: 'self@api.users.com', password: 'test' }, '1.2.3.4');
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
  // - create user
  test('POST /api/users', async () => {
    const rep = await request.post('/api/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'test@api.users.com', password: 'test' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({ lastConnexion: undefined }));
  });

  test('POST /api/users (invalid email)', async () => {
    const rep = await request.post('/api/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'test', password: 'test' })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400, error: 'Invalid value for email'
    });
  });

  test('POST /api/users (no parameters)', async () => {
    const rep = await request.post('/api/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400,
      error: expect.stringMatching(/Missing required parameters: (?:email|password), (?:email|password)/)
    });
  });

  // - create token
  test('POST /api/users/:id/token', async () => {
    const rep = await request.post(`/api/users/${self.id}/token`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ tags: ['Tests'] })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      ...should.token(['Tests']),
      token: should.validate(validator.isJWT)
    });
  });

  // - get a user
  test('GET /api/users/:id', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: [should.token(['Tests'])]
    }));
  });

  // - get all users
  test('GET /api/users', async () => {
    const rep = await request.get('/api/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.arrayContaining([
      should.simpleUser({ _id: admin.id.toString() }),
      should.simpleUser({ _id: self.id.toString() }),
      should.simpleUser({ _id: user.id.toString(), lastConnexion: undefined })
    ]));
  });

  // - update a user
  test('PUT /api/users/:id', async () => {
    const rep = await request.put(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'myself@api.users.com' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      email: 'myself@api.users.com',
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: [should.token(['Tests'])]
    }));
  });

  test('PUT /api/users/:id (password)', async () => {
    const rep = await request.put(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ password: 'myself' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: []
    }));
  });

  test('PUT /api/users/:id (invalid email)', async () => {
    const rep = await request.put(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'test' })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400, error: 'Invalid value for email'
    });
  });

  // - grant a user
  test('PUT /api/users/:id/grant', async () => {
    const rep = await request.put(`/api/users/${self.id}/grant`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'daemons', level: 'UPDATE' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [should.permission('daemons', PLvl.UPDATE)],
      tokens: [should.token(['Tests'])]
    }));
  });

  test('PUT /api/users/:id/grant (invalid name)', async () => {
    const rep = await request.put(`/api/users/${self.id}/grant`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: '', level: 'UPDATE' })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400, error: 'Invalid value for name'
    });
  });

  test('PUT /api/users/:id/grant (no parameters)', async () => {
    const rep = await request.put(`/api/users/${self.id}/grant`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400,
      error: expect.stringMatching(/Missing required parameters: (?:name|level), (?:name|level)/)
    });
  });

  // - elevate a user
  test('PUT /api/users/:id/elevate', async () => {
    const rep = await request.put(`/api/users/${self.id}/elevate`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      admin: true,
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: [should.token(['Tests'])]
    }));
  });

  // - revoke a user
  test('PUT /api/users/:id/revoke', async () => {
    const rep = await request.put(`/api/users/${self.id}/revoke`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'daemons' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [],
      tokens: [should.token(['Tests'])]
    }));
  });

  test('PUT /api/users/:id/revoke (invalid name)', async () => {
    const rep = await request.put(`/api/users/${self.id}/revoke`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: '' })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400, error: 'Invalid value for name'
    });
  });

  test('PUT /api/users/:id/revoke (no parameters)', async () => {
    const rep = await request.put(`/api/users/${self.id}/revoke`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      code: 400, error: 'Missing required parameters: name'
    });
  });

  // - delete a user token
  test('DELETE /api/users/:id/token/:token', async () => {
    const rep = await request.delete(`/api/users/${self.id}/token/${tokenS._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: []
    }));
  });

  // - delete a user
  test('DELETE /api/users/:id', async () => {
    const rep = await request.delete(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(should.user({
      _id: self.id.toString(),
      permissions: [should.permission('daemons', PLvl.READ)],
      tokens: [should.token(['Tests'])]
    }));
  });
});
