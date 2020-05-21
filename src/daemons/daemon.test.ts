import validator from 'validator';

import { DIContainer, loadServices } from 'inversify.config';
import { should } from 'utils';
import { HttpError } from 'utils/errors';

import { DatabaseService } from 'db.service';
import { User } from 'users/user.entity';

import { Daemon } from './daemon.entity';
import { DaemonService } from './daemon.service';

// Tests
describe('users/user.service', () => {
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
  let user: User;
  let daemons: Daemon[];

  beforeEach(async () => {
    await database.connection.transaction(async manager => {
      const usrRepo = manager.getRepository(User);
      const dmnRepo = manager.getRepository(Daemon);

      // Create a user
      user = await usrRepo.save(
        usrRepo.create({ email: 'test@daemon.com', password: 'test' })
      );

      // Create some daemons
      daemons = await dmnRepo.save([
        dmnRepo.create({ owner: user }),
        dmnRepo.create({ }),
      ]);

      daemons = await dmnRepo.findByIds(daemons.map(dmn => dmn.id), { relations: ['owner'] });
    });
  });

  // Empty database
  afterEach(async () => {
    const usrRepo = database.connection.getRepository(User);
    const dmnRepo = database.connection.getRepository(Daemon);

    // Delete created entities
    await usrRepo.delete(user.id);
    await dmnRepo.delete(daemons.map(dmn => dmn.id));
  });

  // Tests
  // - Daemon.lrn
  test('Daemon.lrn', () => {
    const daemon = daemons[0];

    expect(daemon.lrn.id).toEqual(daemon.id);
    expect(daemon.lrn.resource).toEqual('daemon');
    expect(daemon.lrn.parent).toBeUndefined();
  });

  // - Daemon.toJSON
  test('Daemon.toJSON', () => {
    const daemon = daemons[0];

    expect(daemon.toJSON())
      .toEqual({
        id: daemon.id,
        lrn: daemon.lrn.toString(),
        owner: user.toJSON()
      });
  });

  // - DaemonService.create
  test('DaemonService.create', async () => {
    const daemon = await service.create({ ownerId: user.id });
    daemons.push(daemon);

    expect(daemon.id).toEqual(should.validate(validator.isUUID));
    expect(daemon.owner).toEqual(user);
  });

  test('DaemonService.create (invalid owner)', async () => {
    // Invalid value
    await expect(service.create({ ownerId: 'test' }))
      .rejects.toEqual(HttpError.BadRequest('"ownerId" must be a valid GUID'));

    // Unknown value
    await expect(service.create({ ownerId: '00000000-0000-0000-0000-000000000000' }))
      .rejects.toEqual(HttpError.BadRequest('User 00000000-0000-0000-0000-000000000000 not found'));
  });

  // - DaemonService.list
  test('DaemonService.list', async () => {
    expect(await service.list())
      .toEqual(expect.arrayContaining(daemons));
  });

  // - DaemonService.get
  test('DaemonService.get', async () => {
    const daemon = daemons[0];

    expect(await service.get(daemon.id)).toEqual(daemon);
  });

  test('DaemonService.get (invalid id)', async () => {
    await expect(service.get('test'))
      .rejects.toEqual(HttpError.NotFound());
  });

  test('DaemonService.get (unknown id)', async () => {
    await expect(service.get('00000000-0000-0000-0000-000000000000'))
      .rejects.toEqual(HttpError.NotFound('Daemon 00000000-0000-0000-0000-000000000000 not found'));
  });

  // - DaemonService.update
  test('DaemonService.update', async () => {
    const daemon = daemons[1];
    const res = await service.update(daemon.id, { ownerId: user.id });

    expect(res.id).toEqual(daemon.id);
    expect(res.owner).toEqual(user);
  });

  test('DaemonService.update (invalid id)', async () => {
    await expect(service.update('test', {}))
      .rejects.toEqual(HttpError.NotFound());
  });

  test('DaemonService.update (unknown id)', async () => {
    await expect(service.update('00000000-0000-0000-0000-000000000000', {}))
      .rejects.toEqual(HttpError.NotFound('Daemon 00000000-0000-0000-0000-000000000000 not found'));
  });

  test('DaemonService.update (invalid owner)', async () => {
    const daemon = daemons[1];

    // Invalid value
    await expect(service.update(daemon.id, { ownerId: 'test' }))
      .rejects.toEqual(HttpError.BadRequest('"ownerId" must be a valid GUID'));

    // Unknown value
    await expect(service.update(daemon.id, { ownerId: '00000000-0000-0000-0000-000000000000' }))
      .rejects.toEqual(HttpError.BadRequest('User 00000000-0000-0000-0000-000000000000 not found'));
  });

  // - DaemonService.delete
  test('DaemonService.delete', async () => {
    const dmnRepo = database.connection.getRepository(Daemon);
    const daemon = daemons[0];

    await service.delete(daemon.id);

    expect(await dmnRepo.findOne(daemon.id))
      .toBeUndefined();
  });
});
