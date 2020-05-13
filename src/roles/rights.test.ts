import { DIContainer, loadServices } from 'inversify.config';

import { DatabaseService } from 'db.service';
import { LRN } from 'resources/lrn.model';

import { Role } from './role.entity';
import { Rule } from './rule.entity';
import { RightsService } from './rights.service';

// Test suite
describe('roles/rights.service', () => {
  // Load services
  let database: DatabaseService;
  let service: RightsService;

  beforeAll(async () => {
    // Load services
    loadServices();

    database = DIContainer.get(DatabaseService);
    service = DIContainer.get(RightsService);

    // Connect to database
    await database.connect();
  });

  afterAll(async () => {
    // Disconnect from database
    await database.disconnect();
  });

  // Add data
  let role: Role;
  let rules: Rule[]

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      // Repositories
      const roleRepo = manager.getRepository(Role);
      const ruleRepo = manager.getRepository(Rule);

      // Create rules
      rules = await ruleRepo.save([
        ruleRepo.create({
          resource: 'test',
          read: true
        }),
        ruleRepo.create({
          resource: 'test', target: '12345678-1234-1234-1234-123456789abc',
          read: true, write: true
        }),
      ]);

      rules.push(...await ruleRepo.save([
        ruleRepo.create({
          parent: rules[0], resource: 'child',
          create: true
        }),
        ruleRepo.create({
          parent: rules[0], resource: 'child', target: '12345678-1234-1234-1234-123456789abc',
          delete: true
        }),
        ruleRepo.create({
          parent: rules[1], resource: 'child', target: '12345678-1234-1234-1234-123456789abc',
          read: true, delete: true
        })
      ]));

      rules.push(...await ruleRepo.save([
        ruleRepo.create({ parent: rules[2], resource: 'child' })
      ]));

      // Create role
      role = await roleRepo.save(
        roleRepo.create({ name: 'role', rules })
      );
    });
  });

  afterEach(async () => {
    // Repositories
    const roleRepo = database.connection.getRepository(Role);
    const ruleRepo = database.connection.getRepository(Rule);

    // Delete entities
    await roleRepo.delete(role.id);
    await ruleRepo.delete(rules.map(r => r.id));
  });

  // Tests
  // - RightsService.rights
  test('RightsService.rights: role global', async () => {
    const lrn = LRN.parse('lrn::child:00000000-0000-0000-0000-000000000000');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: false,
        read: false,
        write: false,
        delete: false
      });
  });

  test('RightsService.rights: global', async () => {
    const lrn = LRN.parse('lrn::test:00000000-0000-0000-0000-000000000000');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: false,
        read: true,
        write: false,
        delete: false
      });
  });

  test('RightsService.rights: exact', async () => {
    const lrn = LRN.parse('lrn::test:12345678-1234-1234-1234-123456789abc');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: false,
        read: true,
        write: true,
        delete: false
      });
  });

  test('RightsService.rights: global => global', async () => {
    const lrn = LRN.parse('lrn::test:00000000-0000-0000-0000-000000000000::child:00000000-0000-0000-0000-000000000000');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: true,
        read: false,
        write: false,
        delete: false
      });
  });

  test('RightsService.rights: global => exact', async () => {
    const lrn = LRN.parse('lrn::test:00000000-0000-0000-0000-000000000000::child:12345678-1234-1234-1234-123456789abc');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: false,
        read: false,
        write: false,
        delete: true
      });
  });

  test('RightsService.rights: exact => global', async () => {
    const lrn = LRN.parse('lrn::test:12345678-1234-1234-1234-123456789abc::child:00000000-0000-0000-0000-000000000000');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: false,
        read: true,
        write: true,
        delete: false
      });
  });

  test('RightsService.rights: exact => exact', async () => {
    const lrn = LRN.parse('lrn::test:12345678-1234-1234-1234-123456789abc::child:12345678-1234-1234-1234-123456789abc');

    await expect(service.rights(role.id, lrn))
      .resolves.toEqual({
        create: false,
        read: true,
        write: false,
        delete: true
      });
  });
});
