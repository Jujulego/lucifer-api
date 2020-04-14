import mongoose from 'mongoose';

import * as db from 'db';
import { loadServices } from 'inversify.config';
import { parseLRN } from 'utils';

import { Daemon } from 'data/daemon/daemon';
import DaemonModel from 'data/daemon/daemon.model';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';

import { Container } from './container';
import { isCStatus, C_STATUSES } from './container.enum';
import ContainerModel from './container.model';
import ContainerRepository from './container.repository';

// Tests
describe('data/container', () => {
  // Connect to database
  beforeAll(async () => {
    loadServices();
    await db.connect();
  });

  // Fill database
  let user: User;
  let daemon: Daemon;
  let containers: Container[];

  beforeEach(async () => {
    // Create user & daemon
    user = await new UserModel({ email: 'test@container.com', password: 'test' }).save();
    daemon = await new DaemonModel({ name: 'Test', secret: 'test', user: user.id }).save();

    // Create some containers
    containers = await Promise.all([
      new ContainerModel({ image: 'data-test-image1', daemon: daemon.id, status: 'started' }).save(),
      new ContainerModel({ image: 'data-test-image1', daemon: null     , status: 'paused'  }).save(),
      new ContainerModel({ image: 'data-test-image2', daemon: daemon.id, status: 'stopped' }).save(),
    ]);
  });

  // Empty database
  afterEach(async () => {
    // Delete containers, daemons & users
    await Promise.all(containers.map(container => container.remove()));
    await daemon.remove();
    await user.remove();
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - isCStatus
  test('isCStatus: valid entries', () => {
    C_STATUSES.forEach(status => {
      expect(isCStatus(status)).toBeTruthy();
    });
  });

  test('isCStatus: invalid entries', () => {
    expect(isCStatus('')).toBeFalsy();
    expect(isCStatus('tomato')).toBeFalsy();
  });

  // - Container.lrn
  test('Container.lrn', () => {
    const container = containers[0];
    const lrn = parseLRN(container.lrn);

    expect(lrn).not.toBeNull();
    expect(lrn!.id).toEqual(container.id);
    expect(lrn!.type).toEqual('container');
  });

  // - Container.toJSON
  test('Container.toJSON', () => {
    const container = containers[0].toJSON();

    expect(container).toHaveProperty('_id');
    expect(container).toHaveProperty('image');
    expect(container).toHaveProperty('daemon');
    expect(container).toHaveProperty('status');
    expect(container).toHaveProperty('lrn');
  });

  // - ContainerRepository.create
  test('ContainerRepository.create', async () => {
    const repo = new ContainerRepository();
    const container = await repo.create({ image: 'data-test-image', daemon: daemon.id });

    try {
      expect(container._id).toBeDefined();
      expect(container.image).toEqual('data-test-image');
      expect(container.daemon).toEqual(daemon._id);
      expect(container.status).toEqual('stopped');
    } finally {
      await container.remove();
    }
  });
});
