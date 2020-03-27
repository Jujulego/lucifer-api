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
    // Create a permission holder
    [admin, user] = await Promise.all([
      new UserModel({
        email: 'admin@permissions.com', password: 'test', admin: true
      }).save(),
      new UserModel({
        email: 'user@authorize.com', password: 'test', admin: false,
        permissions: []
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

    const res = await service.grant(ctx, user, 'users', PLvl.READ);
    expect(auth.has(res, 'users', PLvl.READ)).toBeTruthy();
  });
});
