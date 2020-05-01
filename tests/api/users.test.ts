import 'reflect-metadata';
import { omit } from 'lodash';
import supertest from 'supertest';
import validator from 'validator';

import { app } from 'app';
import { DatabaseService } from 'db.service';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

import { LRN } from 'bases/lrn';
import { User } from 'users/user.entity';

import { login } from '../utils';

// Tests
describe('api/users', () => {
  // Server setup
  let database: DatabaseService;
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    // Load services
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

  // Fill database
  let admin: User;
  let self: User;
  let user: User;

  let tokenA: string;
  let tokenS: string;

  beforeEach(async () => {
    const repo = database.connection.getRepository(User);

    // Create some users
    [admin, self, user] = await repo.save([
      repo.create({ email: 'admin@api.users.com', password: 'test' }),
      repo.create({ email: 'self@api.users.com',  password: 'test' }),
      repo.create({ email: 'user@api.users.com',  password: 'test' }),
    ]);

    // Get tokens
    tokenA = await login('admin@api.users.com', 'test', '1.2.3.4');
    tokenS = await login('self@api.users.com',  'test', '1.2.3.4');
  });

  // Empty database
  afterEach(async () => {
    const repo = database.connection.getRepository(User);
    await repo.delete([admin.id, self.id, user.id]);
  });

  // Tests
  // - create user
  test('POST /api/users', async () => {
    try {
      const rep = await request.post('/api/users')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'test@api.users.com', password: 'test' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(rep.body).toEqual({
        id: should.validate(validator.isUUID),
        lrn: should.validate(LRN.isLRN),
        email: 'test@api.users.com',
        tokens: []
      });
    } finally {
      const repo = database.connection.getRepository(User);
      await repo.delete({ email: 'test@api.users.com' });
    }
  });

  test('POST /api/users (invalid email)', async () => {
    try {
      const rep = await request.post('/api/users')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ email: 'test', password: 'test' })
        .expect(400)
        .expect('Content-Type', /json/);

      expect(rep.body).toEqual({
        code: 400,
        error: 'Invalid value for email'
      });
    } finally {
      const repo = database.connection.getRepository(User);
      await repo.delete({ email: 'test' });
    }
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
  // test('POST /api/users/:id/token', async () => {
  //   const rep = await request.post(`/api/users/${self.id}/token`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .send({ tags: ['Tests'] })
  //     .expect(200)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual({
  //     ...should.token(['Tests']),
  //     token: should.validate(validator.isJWT)
  //   });
  // });

  // - get a user
  test('GET /api/users/:id', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      id: self.id,
      lrn: self.lrn.toString(),
      email: self.email,
      tokens: [{
        id: should.validate(validator.isUUID),
        date: should.validate(validator.isISO8601),
        tags: []
      }]
    });
  });

  // - get all users
  test('GET /api/users', async () => {
    const rep = await request.get('/api/users')
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.arrayContaining([
      omit(admin.toJSON(), ['tokens']),
      omit(self.toJSON(),  ['tokens']),
      omit(user.toJSON(),  ['tokens'])
    ]));
  });

  // - update a user
  test('PUT /api/users/:id', async () => {
    const rep = await request.put(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ email: 'myself@api.users.com' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.objectContaining({
      id: self.id,
      email: 'myself@api.users.com'
    }));
  });

  test('PUT /api/users/:id (password)', async () => {
    const rep = await request.put(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ password: 'myself' })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.objectContaining({
      id: self.id,
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
  // test('PUT /api/users/:id/grant', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/grant`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .send({ name: 'daemons', level: 'UPDATE' })
  //     .expect(200)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual(should.user({
  //     _id: self.id.toString(),
  //     tokens: [should.token(['Tests'])]
  //   }));
  // });
  //
  // test('PUT /api/users/:id/grant (invalid name)', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/grant`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .send({ name: '', level: 'UPDATE' })
  //     .expect(400)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual({
  //     code: 400, error: 'Invalid value for name'
  //   });
  // });
  //
  // test('PUT /api/users/:id/grant (no parameters)', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/grant`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .expect(400)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual({
  //     code: 400,
  //     error: expect.stringMatching(/Missing required parameters: (?:name|level), (?:name|level)/)
  //   });
  // });
  //
  // // - elevate a user
  // test('PUT /api/users/:id/elevate', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/elevate`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .expect(200)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual(should.user({
  //     _id: self.id.toString(),
  //     admin: true,
  //     tokens: [should.token(['Tests'])]
  //   }));
  // });
  //
  // // - revoke a user
  // test('PUT /api/users/:id/revoke', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/revoke`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .send({ name: 'daemons' })
  //     .expect(200)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual(should.user({
  //     _id: self.id.toString(),
  //     permissions: [],
  //     tokens: [should.token(['Tests'])]
  //   }));
  // });
  //
  // test('PUT /api/users/:id/revoke (invalid name)', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/revoke`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .send({ name: '' })
  //     .expect(400)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual({
  //     code: 400, error: 'Invalid value for name'
  //   });
  // });
  //
  // test('PUT /api/users/:id/revoke (no parameters)', async () => {
  //   const rep = await request.put(`/api/users/${self.id}/revoke`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .expect(400)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual({
  //     code: 400, error: 'Missing required parameters: name'
  //   });
  // });
  //
  // // - delete a user token
  // test('DELETE /api/users/:id/token/:token', async () => {
  //   const rep = await request.delete(`/api/users/${self.id}/token/${tokenS}`)
  //     .set('Authorization', `Bearer ${tokenA}`)
  //     .expect(200)
  //     .expect('Content-Type', /json/);
  //
  //   expect(rep.body).toEqual(should.user({
  //     _id: self.id.toString(),
  //     tokens: []
  //   }));
  // });

  // - delete a user
  test('DELETE /api/users/:id', async () => {
    const rep = await request.delete(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);

    expect(rep.body).toEqual({});
  });
});
