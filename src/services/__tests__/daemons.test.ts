import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';
import { contexts } from 'utils/tests';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { Daemon } from 'data/daemon/daemon';
import DaemonModel from 'data/daemon/daemon.model';
import { PLvl } from 'data/permission/permission.enums';

import DaemonsService from '../daemons.service';

// Tests
describe('services/daemons.service', () => {
  // Connect to database & load services
  beforeAll(async () => {
    await db.connect();
    loadServices();
  });

  // Fill database
  let user: User;
  let owner: User;
  let admin: User;
  let daemon: Daemon;

  beforeEach(async () => {
    // Create some users
    [admin, owner, user] = await Promise.all([
      new UserModel({
        email: 'admin@daemons.com', password: 'test',
        permissions: [{ name: 'daemons', level: PLvl.ALL }]
      }).save(),
      new UserModel({
        email: 'owner@daemons.com', password: 'test', admin: false
      }).save(),
      new UserModel({
        email: 'user@daemons.com', password: 'test', admin: false
      }).save(),
    ]);

    // Create some daemons
    [, daemon] = await Promise.all([
      new DaemonModel({ user: admin.id, secret: 'admin' }).save(),
      new DaemonModel({
        user: owner.id, secret: 'owner',
        tokens: [{ token: 'roar !' }]
      }).save(),
    ]);
  });

  // Empty database
  afterEach(async () => {
    await Promise.all([
      admin.remove(),
      owner.remove(),
      user.remove(),
      daemon.remove()
    ]);
  });

  // Disconnect
  afterAll(async () => {
    await mongoose.disconnect();
  });

  // Tests
  // - DaemonsService.create
  test('DaemonsService.create', async () => {
    const service = DIContainer.get(DaemonsService);

    await contexts(
      [
        { label: 'as admin', user: admin, from: '1.2.3.4', allowed: true  },
        { label: 'as user',  user: user,  from: '1.2.3.4', allowed: false },
      ],
      async (ctx) => await service.create(ctx, { name: 'Test', user: owner.id }),
      (daemon) => {
        expect(daemon._id).toBeDefined();
        expect(daemon.name).toEqual('Test');
        expect(daemon.secret).toHaveLength(42);
        expect(daemon.user).toEqual(owner._id);

        expect(DaemonModel.findById(daemon._id)).not.toBeNull();
      }
    );
  });

  // - DaemonsService.createToken
  test('DaemonsService.createToken', async () => {
    const service = DIContainer.get(DaemonsService);

    await contexts(
      [
        { label: 'as admin',  user:   admin,  from: '1.2.3.4', allowed: true  },
        { label: 'as owner',  user:   owner,  from: '1.2.3.4', allowed: true  },
        { label: 'as daemon', daemon: daemon, from: '1.2.3.4', allowed: true  },
        { label: 'as user',   user:   user,   from: '1.2.3.4', allowed: false },
      ],
      async (ctx) => await service.createToken(ctx, daemon.id, ['Test']),
      (token) => {
        expect(token.token).toBeDefined();
        expect(token.from).toEqual('1.2.3.4');
        expect(token.tags).toEqual(['Test']);
      }
    );
  });

  // - DaemonsService.get
  test('DaemonsService.get', async () => {
    const service = DIContainer.get(DaemonsService);

    await contexts(
      [
        { label: 'as admin',  user:   admin,  from: '1.2.3.4', allowed: true  },
        { label: 'as owner',  user:   owner,  from: '1.2.3.4', allowed: true  },
        { label: 'as daemon', daemon: daemon, from: '1.2.3.4', allowed: true  },
        { label: 'as user',   user:   user,   from: '1.2.3.4', allowed: false },
      ],
      async (ctx) => await service.get(ctx, daemon.id),
      (res) => {
        expect(res.id).toEqual(daemon.id);
      }
    )
  });

  // - DaemonsService.find
  test('DaemonsService.find', async () => {
    const service = DIContainer.get(DaemonsService);

    await contexts(
      [
        { label: 'as admin',  user:   admin,  from: '1.2.3.4', allowed: true, length: 0, not: true },
        { label: 'as owner',  user:   owner,  from: '1.2.3.4', allowed: true, length: 1 },
        { label: 'as daemon', daemon: daemon, from: '1.2.3.4', allowed: true, length: 1 },
        { label: 'as user',   user:   user,   from: '1.2.3.4', allowed: true, length: 0 },
      ],
      async (ctx) => await service.find(ctx),
      (res, { length, not }) => {
        if (not) {
          expect(res).not.toHaveLength(length);
        } else {
          expect(res).toHaveLength(length);
        }
      }
    );
  });

  // - DaemonsService.update
  test('DaemonsService.update', async () => {
    const service = DIContainer.get(DaemonsService);

    await contexts(
      [
        { label: 'as admin',  user:   admin,  from: '1.2.3.4', allowed: true  },
        { label: 'as owner',  user:   owner,  from: '1.2.3.4', allowed: true  },
        { label: 'as daemon', daemon: daemon, from: '1.2.3.4', allowed: true  },
        { label: 'as user',   user:   user,   from: '1.2.3.4', allowed: false },
      ],
      async (ctx) => await service.update(ctx, daemon.id, { name: 'Tomato' }),
      (res) => {
        expect(res.id).toEqual(daemon.id);
        expect(res.name).toEqual('Tomato');
      }
    );
  });

  // - DaemonsService.regenerateSecret
  test('DaemonsService.regenerateSecret', async () => {
    const service = DIContainer.get(DaemonsService);

    await contexts(
      [
        { label: 'as admin',  user:   admin,  from: '1.2.3.4', allowed: true  },
        { label: 'as owner',  user:   owner,  from: '1.2.3.4', allowed: true  },
        { label: 'as daemon', daemon: daemon, from: '1.2.3.4', allowed: true  },
        { label: 'as user',   user:   user,   from: '1.2.3.4', allowed: false },
      ],
      async (ctx) => await service.regenerateSecret(ctx, daemon.id),
      (res) => {
        expect(res._id).toEqual(daemon._id);
        expect(res.secret).not.toEqual(daemon.secret);
        expect(res.tokens).toHaveLength(0);
      }
    );
  });
});
