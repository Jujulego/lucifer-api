import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';

import { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { PLvl } from 'data/permission/permission.enums';
import PermissionRepository from 'data/permission/permission.repository';

import PermissionsService from '../permissions.service';
import { contexts } from 'utils/tests';

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
  test('PermissionsService.grant', async () => {
    const service = DIContainer.get(PermissionsService);
    const repo = new PermissionRepository(user);

    await contexts(
      [
        { label: 'as user',  user: user,  from: '1.2.3.4', allowed: false },
        { label: 'as admin', user: admin, from: '1.2.3.4', allowed: true  },
      ],
      async (ctx) => await service.grant(ctx, user, 'users', PLvl.READ),
      () => {
        const perm = repo.getByName('users');

        expect(perm).not.toBeNull();
        expect(perm!.level).toEqual(PLvl.READ);
      },
      () => {
        expect(repo.getByName('users')).toBeNull();
      }
    );
  });

  // - PermissionsService.revoke
  test('PermissionsService.revoke', async () => {
    const service = DIContainer.get(PermissionsService);
    const repo = new PermissionRepository(user);

    await contexts(
      [
        { label: 'as user',  user: user,  from: '1.2.3.4', allowed: false },
        { label: 'as admin', user: admin, from: '1.2.3.4', allowed: true  },
      ],
      async (ctx) => await service.revoke(ctx, user, 'daemons'),
      () => {
        expect(repo.getByName('daemons')).toBeNull();
      },
      () => {
        const perm = repo.getByName('daemons');

        expect(perm).not.toBeNull();
        expect(perm!.level).toEqual(PLvl.READ);
      }
    );
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
    ).rejects.toBeForbidden();

    expect(user.admin).toBeFalsy();
  });
});
