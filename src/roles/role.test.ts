import { DIContainer, loadServices } from 'inversify.config';

import { DatabaseService } from 'db.service';

import { Role } from './role.entity';
import { Rule } from './rule.entity';
import { RoleService } from './role.service';

// Test suite
describe('roles/role.service', () => {
  // Load services
  let database: DatabaseService;
  let service: RoleService;

  beforeAll(async () => {
    // Load services
    loadServices();

    database = DIContainer.get(DatabaseService);
    service = DIContainer.get(RoleService);

    // Connect to database
    await database.connect();
  });

  afterAll(async () => {
    // Disconnect from database
    await database.disconnect();
  });

  // Tests
  test('RoleService.get', async () => {
    const role = await service.get('2470f591-7a96-4145-a223-fc6783bda22e');
    console.log(role);
  });
});
