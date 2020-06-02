import 'reflect-metadata';
import { omit } from 'lodash';
import supertest from 'supertest';

import { app } from 'app';
import { DIContainer, loadServices } from 'inversify.config';

import { DatabaseService } from 'db.service';
import { User } from 'users/user.entity';

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
        usrRepo.create({ id: 'tests|api-users-1' }),
        usrRepo.create({ id: 'tests|api-users-2' }),
        usrRepo.create({ id: 'tests|api-users-3' }),
      ]);
    });

    // Get tokens
    token = await login('tests|api-users-1', '1.2.3.4');
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);

    await usrRepo.delete([admin.id, self.id, user.id]);
  });

  // Tests
  // - get a user
  test('GET /api/users/:id', async () => {
    const rep = await request.get(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual({
      id: self.id,
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

  // - delete a user
  test('DELETE /api/users/:id', async () => {
    const rep = await request.delete(`/api/users/${self.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(rep.body).toEqual({});
  });
});
