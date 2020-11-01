import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Connection } from 'typeorm';
import validator from 'validator';

import { AppModule } from 'app.module';
import { LocalUser } from 'users/local.entity';
import { Auth0UserService } from 'users/auth0.service';
import { factoryAuth0UserMock } from 'mocks/auth0.mock';

import { should } from 'utils';

import { Daemon } from './daemon.entity';
import { DaemonService } from './daemon.service';

// Load services
let app: TestingModule;
let database: Connection;
let service: DaemonService;

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(Auth0UserService).useFactory(factoryAuth0UserMock('tests|daemons-daemon'))
    .compile();

  database = app.get(Connection);
  service = app.get(DaemonService);
});

afterAll(async () => {
  await app.close();
});

// Fill database
let user: LocalUser;
let daemons: Daemon[];

beforeEach(async () => {
  await database.transaction(async manager => {
    const usrRepo = manager.getRepository(LocalUser);
    const dmnRepo = manager.getRepository(Daemon);

    // Create a user
    user = await usrRepo.save(
      usrRepo.create({ id: 'tests|daemons-daemon-1', email: 'test1@daemon.daemons.com', name: 'Test 1' })
    );

    // Create some daemons
    daemons = await dmnRepo.save([
      dmnRepo.create({ owner: user }),
      dmnRepo.create({ }),
    ]);
  });
});

// Empty database
afterEach(async () => {
  const usrRepo = database.getRepository(LocalUser);
  const dmnRepo = database.getRepository(Daemon);

  // Delete created entities
  await usrRepo.delete(user.id);
  await dmnRepo.delete(daemons.map(dmn => dmn.id));
});

// Tests
describe('DaemonService.create', () => {
  let daemon: Daemon;

  afterEach(async () => {
    const dmnRepo = database.getRepository(Daemon);
    await dmnRepo.delete(daemon.id);
  });

  it('should create a new daemon', async () => {
    daemon = await service.create({ ownerId: user.id });

    expect(daemon)
      .toEqual({
        id:    should.validate(validator.isUUID),
        name:  null,
        owner: expect.objectContaining({ id: user.id })
      });
  });

  it('should fail to create a new daemon', async () => {
    // Unknown value
    await expect(service.create({ ownerId: 'tests|000000000000' }))
      .rejects.toEqual(new BadRequestException('User tests|000000000000 not found'));
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
      .rejects.toEqual(new NotFoundException('Daemon invalid-uuid not found'));

    // Unknown id
    await expect(service.get('00000000-0000-0000-0000-000000000000'))
      .rejects.toEqual(new NotFoundException('Daemon 00000000-0000-0000-0000-000000000000 not found'));
  });
});

describe('DaemonService.update', () => {
  it('should update daemon', async () => {
    const daemon = daemons[1];

    await expect(service.update(daemon.id, { ownerId: user.id }))
      .resolves.toEqual({
        id:    daemon.id,
        name:  null,
        owner: expect.objectContaining({ id: user.id })
      });
  });

  it('should throw a Not Found error', async () => {
    // Invalid id
    await expect(service.update('invalid-uuid', {}))
      .rejects.toEqual(new NotFoundException('Daemon invalid-uuid not found'));

    // Unknown id
    await expect(service.update('00000000-0000-0000-0000-000000000000', {}))
      .rejects.toEqual(new NotFoundException('Daemon 00000000-0000-0000-0000-000000000000 not found'));
  });

  it('should throw a Bad Request error', async () => {
    const daemon = daemons[1];

    // Unknown value
    await expect(service.update(daemon.id, { ownerId: 'tests|000000000000' }))
      .rejects.toEqual(new BadRequestException('User tests|000000000000 not found'));
  });
});

// - DaemonService.delete
test('DaemonService.delete', async () => {
  const daemon = daemons[0];

  await expect(service.delete(daemon.id))
    .resolves.toBeUndefined();

  const dmnRepo = database.getRepository(Daemon);
  await expect(dmnRepo.findOne(daemon.id))
    .resolves.toBeUndefined();
});
