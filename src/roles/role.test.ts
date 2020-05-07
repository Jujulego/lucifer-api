import validator from 'validator';

import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';

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
        ruleRepo.create({ resource: 'test' }),
        ruleRepo.create({ resource: 'test', target: '12345678-1234-1234-1234-123456789abc' }),
      ]);

      rules.push(...await ruleRepo.save([
        ruleRepo.create({ parent: rules[0], resource: 'child' }),
        ruleRepo.create({ parent: rules[0], resource: 'child', target: '12345678-1234-1234-1234-123456789abc' })
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
  test('RoleService.get', async () => {
    await expect(service.get(role.id))
      .resolves.toEqual({
        id: role.id,
        name: 'role',
        create: false, read: false, write: false, delete: false,
        rules: expect.arrayContaining([
          {
            id: should.validate(validator.isUUID),
            resource: 'test',
            target: null,
            create: false, read: false, write: false, delete: false,
            children: expect.arrayContaining([
              {
                id: should.validate(validator.isUUID),
                resource: 'child',
                target: null,
                create: false, read: false, write: false, delete: false,
                children: [
                  {
                    id: should.validate(validator.isUUID),
                    resource: 'child',
                    target: null,
                    create: false, read: false, write: false, delete: false,
                    children: []
                  }
                ]
              },
              {
                id: should.validate(validator.isUUID),
                resource: 'child',
                target: '12345678-1234-1234-1234-123456789abc',
                create: false, read: false, write: false, delete: false,
                children: []
              }
            ])
          },
          {
            id: should.validate(validator.isUUID),
            resource: 'test',
            target: '12345678-1234-1234-1234-123456789abc',
            create: false, read: false, write: false, delete: false,
            children: []
          }
        ])
      });
  });
});
