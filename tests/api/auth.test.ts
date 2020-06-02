import 'reflect-metadata';
import supertest from 'supertest';

import { app } from 'app';
import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

import { DatabaseService } from 'db.service';
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
  let user: User;
  let token: string;

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);

      // Create some users
      [user] = await usrRepo.save([
        usrRepo.create({ id: 'tests|api-auth-1' })
      ]);
    });

    // Get tokens
    token = await login('tests|api-auth-1');
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);
    await usrRepo.delete([user.id]);
  });

  // Tests
  // - connexion check
  test('GET /api/users/:id (connected)', async () => {
    await request.get(`/api/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);
  });

  test('GET /api/users/:id (not connected)', async () => {
    const rep = await request.get(`/api/users/${user.id}`)
      .expect(401)
      .expect('Content-Type', /json/);

    expect(rep.body)
      .toEqual(should.be.unauthorized());
  });
});
