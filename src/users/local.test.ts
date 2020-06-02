import validator from 'validator';

import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

import { DatabaseService } from 'db.service';

import { LocalService } from './local.service';

// Load services
let database: DatabaseService;
let service: LocalService;

beforeAll(async () => {
  loadServices();

  database = DIContainer.get(DatabaseService);
  service = DIContainer.get(LocalService);

  // Connect to databse
  await database.connect();
});

afterAll(async () => {
  await database.disconnect();
});

// Tests
test('LocalService.getOrCreate', async () => {
  const user = await service.getOrCreate('tests|users-local-10');

  try {
    expect(user).toEqual({
      id: should.validate(validator.isUUID),
      auth0: 'tests|users-local-10'
    });

  } finally {
    await service.repository.delete(user.id);
  }
});
