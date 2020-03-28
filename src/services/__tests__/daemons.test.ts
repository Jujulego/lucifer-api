import mongoose from 'mongoose';
import 'reflect-metadata';

import * as db from 'db';
import DIContainer, { loadServices } from 'inversify.config';

import Context, { TestContext } from 'bases/context';
import { HttpError } from 'middlewares/errors';

import { User } from 'data/user/user';
import UserModel from 'data/user/user.model';
import { Daemon } from 'data/daemon/daemon';
import DaemonModel from 'data/daemon/daemon.model';
import { PLvl } from 'data/permission/permission.enums';

import DaemonsService from '../daemons.service';

type B<A> = { name: string, allowed: boolean, args?: A };
type PU<A> = B<A> & { user: () => User };
type PD<A> = B<A> & { daemon: () => Daemon };

type P<A> = PU<A> | PD<A>;

function rtest<A, T>(name: string, matrix: P<A>[], call: (ctx: Context, args: any) => Promise<T>, succeed: (res: T, args: any) => void) {
  matrix.map(params => {
    test(`${name}: ${params.name}`, async () => {
      let ctx: Context;

      if ("user" in params) {
        ctx = TestContext.withUser(params.user(), '1.2.3.4');
      } else {
        ctx = TestContext.withDaemon(params.daemon(), '1.2.3.4');
      }

      if (params.allowed) {
        const res = await call(ctx, params.args);
        await succeed(res, params.args);
      } else {
        await expect(call(ctx, params.args)).rejects
          .toThrowError(HttpError.Forbidden('Not allowed'));
      }
    });
  });
}

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
    const ctx = TestContext.withUser(admin, '1.2.3.4');

    const daemon = await service.create(ctx, { name: 'Test', user: owner.id });

    try {
      expect(daemon._id).toBeDefined();
      expect(daemon.name).toEqual('Test');
      expect(daemon.secret).toHaveLength(42);
      expect(daemon.user).toEqual(owner._id);

      expect(DaemonModel.findById(daemon._id)).not.toBeNull();
    } finally {
      await DaemonModel.findByIdAndDelete(daemon._id);
    }
  });

  test('DaemonsService.create: not allowed', async () => {
    const service = DIContainer.get(DaemonsService);
    const ctx = TestContext.withUser(user, '1.2.3.4');

    await expect(
      service.create(ctx, { name: 'Test', user: owner.id })
    ).rejects.toThrowError(HttpError.Forbidden('Not allowed'));
  });

  // - DaemonsService.createToken
  rtest('DaemonsService.createToken',
    [
      { name: 'by admin',  user:   () => admin,  allowed: true },
      { name: 'by owner',  user:   () => owner,  allowed: true },
      { name: 'by daemon', daemon: () => daemon, allowed: true },
      { name: 'by user',   user:   () => user,   allowed: false },
    ],
    async (ctx) => {
      const service = DIContainer.get(DaemonsService);

      return await service.createToken(ctx, daemon.id, ['Test']);
    },
    (token) => {
      expect(token.token).toBeDefined();
      expect(token.from).toEqual('1.2.3.4');
      expect(token.tags).toEqual(['Test']);
    }
  );

  // - DaemonsService.get
  rtest('DaemonsService.get',
    [
      { name: 'by admin',  user:   () => admin,  allowed: true },
      { name: 'by owner',  user:   () => owner,  allowed: true },
      { name: 'by daemon', daemon: () => daemon, allowed: true },
      { name: 'by user',   user:   () => user,   allowed: false },
    ],
    async (ctx: Context) => {
      const service = DIContainer.get(DaemonsService);

      return await service.get(ctx, daemon.id);
    },
    (res) => {
      expect(res.id).toEqual(daemon.id);
    }
  );

  // - DaemonsService.find
  rtest('DaemonsService.find',
    [
      { name: 'by admin',  user:   () => admin,  allowed: true, args: { length: 0, not: true } },
      { name: 'by owner',  user:   () => owner,  allowed: true, args: { length: 1 } },
      { name: 'by daemon', daemon: () => daemon, allowed: true, args: { length: 1 } },
      { name: 'by user',   user:   () => user,   allowed: true, args: { length: 0 } },
    ],
    async (ctx: Context) => {
      const service = DIContainer.get(DaemonsService);

      return await service.find(ctx);
    },
    (res, { length, not }) => {
      if (not) {
        expect(res).not.toHaveLength(length);
      } else {
        expect(res).toHaveLength(length);
      }
    }
  );

  // - DaemonsService.update
  rtest('DaemonsService.update',
    [
      { name: 'by admin',  user:   () => admin,  allowed: true },
      { name: 'by owner',  user:   () => owner,  allowed: true },
      { name: 'by daemon', daemon: () => daemon, allowed: true },
      { name: 'by user',   user:   () => user,   allowed: false },
    ],
    async (ctx: Context) => {
      const service = DIContainer.get(DaemonsService);

      return await service.update(ctx, daemon.id, { name: 'Tomato' });
    },
    (res) => {
      expect(res.id).toEqual(daemon.id);
      expect(res.name).toEqual('Tomato');
    }
  );

  // - DaemonsService.regenerateSecret
  rtest('DaemonsService.update',
    [
      { name: 'by admin',  user:   () => admin,  allowed: true },
      { name: 'by owner',  user:   () => owner,  allowed: true },
      { name: 'by daemon', daemon: () => daemon, allowed: true },
      { name: 'by user',   user:   () => user,   allowed: false },
    ],
    async (ctx: Context) => {
      const service = DIContainer.get(DaemonsService);

      return await service.regenerateSecret(ctx, daemon.id);
    },
    (res) => {
      expect(res._id).toEqual(daemon._id);
      expect(res.tokens).toHaveLength(0);
    }
  );
});
