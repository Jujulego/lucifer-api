import mongoose from "mongoose";

import * as db from 'db';
import { loadServices } from 'inversify.config';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';

import PermissionRepository from './permission.repository';
import { isPLvl, isPName, LEVELS, PERMISSIONS, PLvl } from './permission.enums';

// Tests
describe("data/permission", () => {
  // Connect to database
  beforeAll(async () => {
    loadServices();
    await db.connect();
  });

  // Fill database
  let user: User;

  beforeEach(async () => {
    // Create a permission holder
    user = await (new UserModel({
      email: 'test@permission.com', password: 'test',
      permissions: [
        { name: 'users', level: PLvl.READ }
      ]
    })).save();
  });

  // Empty database
  afterEach(async () => {
    await user.remove();
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - isPLvl
  test('isPLvl: valid entries', () => {
    LEVELS.forEach(lvl => {
      expect(isPLvl(lvl)).toBeTruthy();
    });
  });

  test('isPLvl: invalid entries', () => {
    expect(isPLvl('')).toBeFalsy();
    expect(isPLvl('tomato')).toBeFalsy();
  });

  // - isPName
  test('isPName: valid entries', () => {
    PERMISSIONS.forEach(name => {
      expect(isPName(name)).toBeTruthy();
    });
  });

  test('isPName: invalid entries', () => {
    expect(isPName('')).toBeFalsy();
    expect(isPName('tomato')).toBeFalsy();
  });

  // - PermissionRepository.setAdmin
  test('PermissionRepository.setAdmin: true', async () => {
    const repo = new PermissionRepository(user);

    const res = await repo.setAdmin(true);
    expect(res.admin).toBeTruthy();
  });

  test('PermissionRepository.setAdmin: false', async () => {
    const repo = new PermissionRepository(user);

    const res = await repo.setAdmin(false);
    expect(res.admin).toBeFalsy();
  });

  // - PermissionRepository.getByName
  test('PermissionRepository.getByName: granted permission', () => {
    const repo = new PermissionRepository(user);

    const res = repo.getByName('users');
    expect(res).not.toBeNull();
    expect(res!.name).toEqual('users');
    expect(res!.level).toEqual(PLvl.READ);
  });

  test('PermissionRepository.getByName: not granted permission', () => {
    const repo = new PermissionRepository(user);

    const res = repo.getByName('daemons');
    expect(res).toBeNull();
  });

  // - PermissionRepository.update
  test('PermissionRepository.update: grant new permission', async () => {
    const repo = new PermissionRepository(user);

    const res = await repo.update('daemons', PLvl.READ);
    expect(res.permissions).toHaveLength(2);

    const perm = res.permissions.find(p => p.name === 'daemons');
    expect(perm).toBeDefined();
    expect(perm!.level).toEqual(PLvl.READ);
  });

  test('PermissionRepository.update: change level', async () => {
    const repo = new PermissionRepository(user);

    const res = await repo.update('users', PLvl.UPDATE);
    expect(res.permissions).toHaveLength(1);

    const perm = res.permissions.find(p => p.name === 'users');
    expect(perm).toBeDefined();
    expect(perm!.level).toEqual(PLvl.UPDATE);
  });

  // - PermissionRepository.delete
  test('PermissionRepository.delete: granted permission', async () => {
    const repo = new PermissionRepository(user);

    const res = await repo.delete('users');
    expect(res.permissions).toHaveLength(0);
  });

  test('PermissionRepository.delete: not granted permission', async () => {
    const repo = new PermissionRepository(user);

    const res = await repo.delete('daemons');
    expect(res.permissions).toHaveLength(1);
  });
});
