import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';
import should from 'utils/should';

import { TestContext } from 'bases/context';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { PLvl } from 'data/permission/permission.enums';

import AuthorizeService from '../authorize.service';

// Tests
describe('services/authorize.service', () => {
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
        email: 'admin@authorize.com', password: 'test', admin: true,
        permissions: [{ name: 'users', level: PLvl.READ }]
      }).save(),
      new UserModel({
        email: 'user@authorize.com', password: 'test', admin: false,
        permissions: [{ name: 'users', level: PLvl.READ }]
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
  // - AuthorizeService.has
  test('AuthorizeService.has: granted permission', async () => {
    const service = DIContainer.get(AuthorizeService);
    const ctxU = TestContext.withUser(user, '1.2.3.4');
    const ctxA = TestContext.withUser(admin, '1.2.3.4');

    expect(await service.has(ctxU, 'users', PLvl.READ)).toBeTruthy();
    expect(await service.has(ctxA, 'users', PLvl.READ)).toBeTruthy();
  });

  test('AuthorizeService.has: not granted permission', async () => {
    const service = DIContainer.get(AuthorizeService);
    const ctxU = TestContext.withUser(user, '1.2.3.4');
    const ctxA = TestContext.withUser(admin, '1.2.3.4');

    expect(await service.has(ctxU, 'daemons', PLvl.READ)).toBeFalsy();
    expect(await service.has(ctxA, 'daemons', PLvl.READ)).toBeTruthy();
  });

  test('AuthorizeService.has: not granted permission level', async () => {
    const service = DIContainer.get(AuthorizeService);
    const ctxU = TestContext.withUser(user, '1.2.3.4');
    const ctxA = TestContext.withUser(admin, '1.2.3.4');

    expect(await service.has(ctxU, 'users', PLvl.UPDATE)).toBeFalsy();
    expect(await service.has(ctxA, 'users', PLvl.UPDATE)).toBeTruthy();
  });

  // - AuthorizeService.allow
  test('AuthorizeService.allow: authorized', async () => {
    const service = DIContainer.get(AuthorizeService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(service.allow(ctx, 'users', PLvl.READ)).resolves.not.toThrow();
  });

  test('AuthorizeService.allow: unauthorized', async () => {
    const service = DIContainer.get(AuthorizeService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await should.not.beAllowed(service.allow(ctx, 'daemons', PLvl.READ));
  });
});
