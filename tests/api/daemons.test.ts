import 'reflect-metadata';
import supertest from 'supertest';

import { app } from 'app';
import { DatabaseService } from 'db.service';
import { DIContainer, loadServices } from 'inversify.config';

import { Daemon } from 'daemons/daemon.entity';
import { User } from 'users/user.entity';

import { login } from '../utils';

// Tests
describe('api/daemons', () => {
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
  let daemon: Daemon;
  let token: string;

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);
      const dmnRepo = manager.getRepository(Daemon);

      // Create a user
      user = await usrRepo.save(
        usrRepo.create({ id: 'tests|api-daemons-1' }),
      );

      // Create a daemon
      daemon = await dmnRepo.save(
        dmnRepo.create({ owner: user }),
      );
    });

    // Get tokens
    token = await login('tests|api-daemons-1');
  });

  // Empty database
  afterEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);
      const dmnRepo = manager.getRepository(Daemon);

      // Delete all
      await dmnRepo.delete(daemon.id);
      await usrRepo.delete(user.id);
    });
  });

  // Tests
  // - get all daemons
  test('GET /api/daemons', async () => {
    const rep = await request.get('/api/daemons')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /json/);

    expect(rep.body).toEqual(expect.arrayContaining([
      daemon.toJSON()
    ]));
  });
});
