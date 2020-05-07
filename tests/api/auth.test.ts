import 'reflect-metadata';
import supertest from 'supertest';
import validator from 'validator';

import { app } from 'app';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

import { DatabaseService } from 'db.service';
import { Role } from 'roles/role.entity';
import { User } from 'users/user.entity';

import { login } from '../utils';

// Tests
describe('/api (auth)', () => {
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
  let token: string;

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const rolRepo = manager.getRepository(Role);
      const usrRepo = manager.getRepository(User);

      // Create some users
      [admin] = await usrRepo.save([
        usrRepo.create({ role: rolRepo.create(), email: 'admin@api.auth.com', password: 'test' })
      ]);
    });

    // Get tokens
    token = await login('admin@api.auth.com', 'test', '1.2.3.4');
  });

  // Empty database
  afterEach(async () => {
    const rolRepo = database.connection.getRepository(Role);
    await rolRepo.delete([admin.id]);
  });

  // Tests
  // - user login
  test('POST /api/login', async () => {
    const rep = await request.post('/api/login')
      .send({ email: 'admin@api.auth.com', password: 'test', tags: ['Tests'] })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      token: should.validate(validator.isJWT)
    });
  });

  test('POST /api/login (wrong credentials)', async () => {
    const rep = await request.post('/api/login')
      .send({ email: 'wrong@api.auth.com', password: 'test', tags: ['Tests'] })
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body)
      .toEqual(should.be.unauthorized());
  });

  test('POST /api/login (invalid email)', async () => {
    const rep = await request.post('/api/login')
      .send({ email: 'wrong', password: 'test', tags: ['Tests'] })
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body)
      .toEqual(should.be.unauthorized());
  });

  test('POST /api/login (missing credentials)', async () => {
    const rep = await request.post('/api/login')
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body)
      .toEqual(should.be.unauthorized());
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

    expect(rep.body)
      .toEqual(should.be.unauthorized());
  });
});
