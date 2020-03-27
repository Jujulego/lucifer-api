import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';

import { TestContext } from 'bases/context';
import { HttpError } from 'middlewares/errors';

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
  test('AuthorizeService.has: granted permission', () => {
    const service = DIContainer.get(AuthorizeService);

    expect(service.has(user, 'users', PLvl.READ)).toBeTruthy();
    expect(service.has(admin, 'users', PLvl.READ)).toBeTruthy();
  });

  test('AuthorizeService.has: not granted permission', () => {
    const service = DIContainer.get(AuthorizeService);

    expect(service.has(user, 'daemons', PLvl.READ)).toBeFalsy();
    expect(service.has(admin, 'daemons', PLvl.READ)).toBeTruthy();
  });

  test('AuthorizeService.has: not granted permission level', () => {
    const service = DIContainer.get(AuthorizeService);

    expect(service.has(user, 'users', PLvl.UPDATE)).toBeFalsy();
    expect(service.has(admin, 'users', PLvl.UPDATE)).toBeTruthy();
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

    await expect(
      service.allow(ctx, 'daemons', PLvl.READ)
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });
});
