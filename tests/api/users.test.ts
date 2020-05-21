import 'reflect-metadata';
import { omit } from 'lodash';
import supertest from 'supertest';
import validator from 'validator';

import { app } from 'app';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

import { DatabaseService } from 'db.service';
import { LRN } from 'resources/lrn.model';
import { User } from 'users/user.entity';
import { TokenService } from 'users/token.service';

import { login } from '../utils';

// Tests
describe('/api/users', () => {
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

  let token: string;

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);

      // Create some users
      [admin, self, user] = await usrRepo.save([
        usrRepo.create({ email: 'admin@api.users.com',  password: 'test' }),
        usrRepo.create({ email: 'self@api.users.com',  password: 'test' }),
        usrRepo.create({ email: 'user@api.users.com',  password: 'test' }),
      ]);
    });

    // Get tokens
    token = await login('admin@api.users.com', 'test', '1.2.3.4');
    await login('self@api.users.com',  'test', '1.2.3.4');
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);

    await usrRepo.delete([admin.id, self.id, user.id]);
  });

  // Tests
  // - create user
  test('POST /api/users', async () => {
    try {
      const rep = await request.post('/api/users')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@api.users.com', password: 'test' })
        .expect(200)
        .expect('Content-Type', /json/);

      expect(rep.body).toEqual({
        id: should.validate(validator.isUUID),
        lrn: should.validate(LRN.isLRN),
        email: 'test@api.users.com',
        daemons: [],
        tokens: []
      });
    } finally {
      const repo = database.connection.getRepository(User);
      await repo.delete({ email: 'test@api.users.com' });
    }
  });

  test('POST /api/users (no parameters)', async () => {
    const rep = await request.post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body)
      .toEqual(should.be.badRequest(expect.stringMatching(/"(?:email|password)" is required/)));
  });

  // - get a user
  test('GET /api/users/:id', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      id: self.id,
      lrn: self.lrn.toString(),
      email: self.email,
      tokens: [{
        id: should.validate(validator.isUUID),
        lrn: should.validate(LRN.isLRN),
        date: should.validate(validator.isISO8601),
        ip: '1.2.3.4',
        tags: []
      }]
    });
  });

  // - get all users
  test('GET /api/users', async () => {
    const rep = await request.get('/api/users')
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
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
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'test' })
      .expect(400)
      .expect('Content-Type', /json/);

    expect(rep.body)
      .toEqual(should.be.badRequest('"email" must be a valid email'));
  });

  // - delete a user
  test('DELETE /api/users/:id', async () => {
    const rep = await request.delete(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(rep.body).toEqual({});
  });
});

describe('/api/users/:userId/tokens', () => {
  // Server setup
  let database: DatabaseService;
  let tokens: TokenService;
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    // Load services
    loadServices();

    database = DIContainer.get(DatabaseService);
    tokens = DIContainer.get(TokenService);
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
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);

      // Create some users
      [admin, self, user] = await usrRepo.save([
        usrRepo.create({ email: 'admin@api.users.tks', password: 'test' }),
        usrRepo.create({ email: 'self@api.users.tks',  password: 'test' }),
        usrRepo.create({ email: 'user@api.users.tks',  password: 'test' }),
      ]);
    });

    // Get tokens
    tokenA = await login('admin@api.users.tks', 'test', '1.2.3.4');
    tokenS = await login('self@api.users.tks',  'test', '1.2.3.4');
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);
    await usrRepo.delete([admin.id, self.id, user.id]);
  });

  // Tests
  // - get all tokens
  test('GET /api/users/:userId/tokens', async () => {
    const token = tokens.decrypt(tokenS);
    const rep = await request.get(`/api/users/${self.id}/tokens/`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: token.id,
      })
    ]));
  });

  // - delete a token
  test('DELETE /api/users/:userId/tokens/:tokenId', async () => {
    const token = tokens.decrypt(tokenS);
    await request.delete(`/api/users/${self.id}/tokens/${token.id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200);
  });
});
