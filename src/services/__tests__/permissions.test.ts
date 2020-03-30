import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';
import should from 'utils/should';

import { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { PLvl } from 'data/permission/permission.enums';
import PermissionRepository from 'data/permission/permission.repository';

import PermissionsService from '../permissions.service';

// Tests
describe('services/permissions.service', () => {
  // Connect to database & load services
  let service: PermissionsService;

  beforeAll(async () => {
    await db.connect();
    loadServices();

    service = DIContainer.get(PermissionsService);
  });

  // Fill database
  let user: User;
  let admin: User;

  beforeEach(async () => {
    // Create some users
    [admin, user] = await Promise.all([
      new UserModel({
        email: 'admin@permissions.com', password: 'test', admin: true
      }).save(),
      new UserModel({
        email: 'user@permissions.com', password: 'test', admin: false,
        permissions: [{ name: 'daemons', level: PLvl.READ }]
      }).save(),
    ]);
  });

  // Empty database
  afterEach(async () => {
    await Promise.all([
      admin.remove(),
      user.remove()
    ]);
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - PermissionsService.grant
  test('PermissionsService.grant', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    await service.grant(ctx, user, 'users', PLvl.READ);

    const repo = new PermissionRepository(user);
    expect(repo.getByName('users'))
      .toEqual(expect.objectContaining({
        level: PLvl.READ
      }));
  });

  test('PermissionsService.grant: not allowed', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.grant(ctx, user, 'users', PLvl.READ));

    const repo = new PermissionRepository(user);
    expect(repo.getByName('users')).toBeNull();
  });

  // - PermissionsService.revoke
  test('PermissionsService.revoke', async () => {
    const ctx = TestContext.withUser(admin, '1.2.3.4');
    await service.revoke(ctx, user, 'daemons');

    const repo = new PermissionRepository(user);
    expect(repo.getByName('daemons')).toBeNull();
  });

  test('PermissionsService.revoke: not allowed', async () => {
    const ctx = TestContext.withUser(user, '1.2.3.4');
    await should.not.beAllowed(service.revoke(ctx, user, 'daemons'));

    const repo = new PermissionRepository(user);
    expect(repo.getByName('daemons'))
      .toEqual(expect.objectContaining({
        level: PLvl.READ
      }));
  });

  // - PermissionsService.elevate
  test('PermissionsService.elevate: elevate user', async () => {
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    await service.elevate(ctx, user);
    expect(user.admin).toBeTruthy();
  });

  test('PermissionsService.elevate: downgrade user', async () => {
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    await service.elevate(ctx, admin, false);
    expect(admin.admin).toBeFalsy();
  });

  test('PermissionsService.elevate: not allowed to elevate', async () => {
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await should.not.beAllowed(service.elevate(ctx, user));
    expect(user.admin).toBeFalsy();
  });
});
