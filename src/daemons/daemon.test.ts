import validator from 'validator';

import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { LocalUser } from 'users/local.entity';
import { Auth0UserService } from 'users/auth0.service';

import { Daemon } from './daemon.entity';
import { DaemonService } from './daemon.service';

import 'users/auth0.mock';
import { MockAuth0UserService } from 'users/auth0.mock';
import auth0Mock from 'mocks/auth0.mock.json';

// Load services
let database: DatabaseService;
let service: DaemonService;

beforeAll(async () => {
  // Load services
  loadServices();

  database = DIContainer.get(DatabaseService);
  service = DIContainer.get(DaemonService);

  // Connect to database
  await database.connect();
});

afterAll(async () => {
  // Disconnect from database
  await database.disconnect();
});

// Fill database
let user: LocalUser;
let daemons: Daemon[];

beforeEach(async () => {
  await database.connection.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);
    const dmnRepo = manager.getRepository(Daemon);

    // Create a user
    user = await usrRepo.save(
      usrRepo.create({ id: 'tests|daemons-daemon-1' })
    );

    // Create some daemons
    daemons = await dmnRepo.save([
      dmnRepo.create({ owner: user }),
      dmnRepo.create({ }),
    ]);
  });

  // Set mock data
  (DIContainer.get(Auth0UserService) as MockAuth0UserService)
    .setMockData('tests|daemons-daemon', auth0Mock);
});

// Empty database
afterEach(async () => {
  const usrRepo = database.connection.getRepository(LocalUser);
  const dmnRepo = database.connection.getRepository(Daemon);

  // Delete created entities
  await usrRepo.delete(user.id);
  await dmnRepo.delete(daemons.map(dmn => dmn.id));
});

// Tests
test('Daemon.toJSON', () => {
  const daemon = daemons[0];

  expect(daemon.toJSON())
    .toEqual({
      id: daemon.id,
      ownerId: user.id
    });
});

describe('DaemonService.create', () => {
  let daemon: Daemon;

  afterEach(async () => {
    const dmnRepo = database.connection.getRepository(Daemon);
    await dmnRepo.delete(daemon.id);
  });

  it('should create a new daemon', async () => {
    daemon = await service.create({ ownerId: user.id });

    expect(daemon)
      .toEqual(expect.objectContaining({
        id: should.validate(validator.isUUID),
        ownerId: user.id
      }));
  });

  it('should fail to create a new daemon', async () => {
    // Unknown value
    await expect(service.create({ ownerId: 'tests|000000000000' }))
      .rejects.toEqual(HttpError.BadRequest('User tests|000000000000 not found'));
  });
});

test('DaemonService.list', async () => {
  await expect(service.list())
    .resolves.toEqual(expect.arrayContaining(
      daemons.map(dmn => expect.objectContaining({ id: dmn.id }))
    ));
});

describe('DaemonService.get', () => {
  it('should return a daemon', async () => {
    const daemon = daemons[0];

    await expect(service.get(daemon.id))
      .resolves.toEqual(expect.objectContaining({
        id: daemon.id
      }));
  });

  it('should throw a Not Found error', async () => {
    // Invalid id
    await expect(service.get('invalid-uuid'))
      .rejects.toEqual(HttpError.NotFound('Daemon invalid-uuid not found'));

    // Unknown id
    await expect(service.get('00000000-0000-0000-0000-000000000000'))
      .rejects.toEqual(HttpError.NotFound('Daemon 00000000-0000-0000-0000-000000000000 not found'));
  });
});

describe('DaemonService.update', () => {
  it('should update daemon', async () => {
    const daemon = daemons[1];

    await expect(service.update(daemon.id, { ownerId: user.id }))
      .resolves.toEqual({
        id:      daemon.id,
        ownerId: user.id,
        owner:   expect.objectContaining({ id: user.id })
      });
  });

  it('should throw a Not Found error', async () => {
    // Invalid id
    await expect(service.update('invalid-uuid', {}))
      .rejects.toEqual(HttpError.NotFound('Daemon invalid-uuid not found'));

    // Unknown id
    await expect(service.update('00000000-0000-0000-0000-000000000000', {}))
      .rejects.toEqual(HttpError.NotFound('Daemon 00000000-0000-0000-0000-000000000000 not found'));
  });

  it('should throw a Bad Request error', async () => {
    const daemon = daemons[1];

    // Unknown value
    await expect(service.update(daemon.id, { ownerId: 'tests|000000000000' }))
      .rejects.toEqual(HttpError.BadRequest('User tests|000000000000 not found'));
  });
});

// - DaemonService.delete
test('DaemonService.delete', async () => {
  const daemon = daemons[0];

  await expect(service.delete(daemon.id))
    .resolves.toBeUndefined();

  const dmnRepo = database.connection.getRepository(Daemon);
  await expect(dmnRepo.findOne(daemon.id))
    .resolves.toBeUndefined();
});
