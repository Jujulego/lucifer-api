import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';

import { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { PLvl } from 'data/permission/permission.enums';

import AuthorizeService from '../authorize.service';
import PermissionsService from '../permissions.service';
import { HttpError } from '../../middlewares/errors';

// Tests
describe('services/permissions.service', () => {
  // Connect to database & load services
  beforeAll(async () => {
    await db.connect();
    loadServices();
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
  test('PermissionsService.grant: grant permission to user', async () => {
    const auth = DIContainer.get(AuthorizeService);
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    await service.grant(ctx, user, 'users', PLvl.READ);
    expect(auth.has(user, 'users', PLvl.READ)).toBeTruthy();
  });

  test('PermissionsService.grant: not allowed to grant', async () => {
    const auth = DIContainer.get(AuthorizeService);
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.grant(ctx, user, 'users', PLvl.READ)
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
    expect(auth.has(user, 'users', PLvl.READ)).toBeFalsy();
  });

  // - PermissionsService.revoke
  test('PermissionsService.revoke: revoke permission to user', async () => {
    const auth = DIContainer.get(AuthorizeService);
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    await service.revoke(ctx, user, 'daemons');
    expect(auth.has(user, 'daemons', PLvl.READ)).toBeFalsy();
  });

  test('PermissionsService.revoke: not allowed to revoke', async () => {
    const auth = DIContainer.get(AuthorizeService);
    const service = DIContainer.get(PermissionsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.revoke(ctx, user, 'daemons')
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
    expect(auth.has(user, 'users', PLvl.READ)).toBeFalsy();
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

    await expect(
      service.elevate(ctx, user)
    ).rejects.toThrowError(HttpError.Forbidden());
    expect(user.admin).toBeFalsy();
  });
});
