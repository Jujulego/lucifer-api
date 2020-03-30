import { omit } from 'lodash';

import { HttpError } from 'middlewares/errors';

import { DataEmitter } from 'bases/data';
import Context from 'bases/context';

import {
  Credentials,
  Daemon,
  DaemonCreate,
  DaemonFilter,
  DaemonObject,
  DaemonUpdate,
  SimpleDaemon
} from 'data/daemon/daemon';
import DaemonRepository from 'data/daemon/daemon.repository';
import { PLvl, PName } from 'data/permission/permission.enums';
import { Token, TokenObj } from 'data/token/token';
import TokenRepository from 'data/token/token.repository';

import ApiEventService from 'services/api-event.service';
import AuthorizeService from 'services/authorize.service';
import PermissionsService from 'services/permissions.service';

import { parseLRN, randomString, Service } from 'utils';

export type LoginToken = Pick<Token, '_id' | 'token'> & { daemon: Daemon['_id'] }

// Controller
@Service(DaemonsService)
class DaemonsService extends DataEmitter<Daemon> {
  // Attributes
  private readonly daemonRepo = new DaemonRepository();

  // Constructor
  constructor(
    apievents: ApiEventService,
    private authorizer: AuthorizeService,
    private permissions: PermissionsService
  ) { super(apievents); }

  // Utils
  private static getTokenRepository(daemon: Daemon): TokenRepository<Daemon> {
    return new TokenRepository(daemon);
  }

  private static simplifyDaemon(daemon: Daemon): SimpleDaemon {
    return omit(daemon, ['permissions', 'tokens']);
  }

  private async rights(ctx: Context, id: string): Promise<boolean> {
    if (ctx.daemon) { // Daemon override
      const daemon = await ctx.daemon;
      if (daemon.id === id) return true;
    }

    if (ctx.user) { // User override
      const user = await ctx.user;
      if (await this.daemonRepo.getByUser(id, user.id)) return true;
    }

    return false;
  }

  protected async hasRights(ctx: Context, level: PLvl, id?: string | null): Promise<boolean> {
    if (id && await this.rights(ctx, id)) return true;
    return await this.authorizer.has(ctx, 'daemons', level);
  }

  protected async allow(ctx: Context, level: PLvl, id?: string | null) {
    if (id && await this.rights(ctx, id)) return;
    return await this.authorizer.allow(ctx, 'daemons', level);
  }

  protected async getDaemon(id: string): Promise<Daemon> {
    // Find daemon
    const daemon = await this.daemonRepo.getById(id);
    if (!daemon) throw HttpError.NotFound(`No daemon found at ${id}`);

    return daemon;
  }

  protected getTargets(data: Daemon) {
    return {
      [data.lrn]: (data: Daemon) => data.toJSON(),
      daemons: DaemonsService.simplifyDaemon
    };
  }

  protected async generateToken(ctx: Context, daemon: Daemon, login: boolean, tags: string[]): Promise<Token> {
    return await DaemonsService.getTokenRepository(daemon)
      .create(ctx, { lrn: daemon.lrn }, login, '7 days', tags);
  }

  // Methods
  async create(ctx: Context, data: DaemonCreate): Promise<DaemonObject> {
    await this.allow(ctx, PLvl.CREATE);

    // Create daemon
    const secret = randomString(42);
    const daemon = await this.daemonRepo.create(data, secret);

    this.emitCreate(daemon);
    return { ...daemon.toObject(), secret }; // Send full daemon with clear secret
  }

  async createToken(ctx: Context, id: string, tags: string[] = []): Promise<TokenObj> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Generate token
    const daemon = await this.getDaemon(id);
    const token = await this.generateToken(ctx, daemon, false, tags);
    this.emitUpdate(daemon);

    return token.toObject();
  }

  async get(ctx: Context, id: string): Promise<Daemon> {
    await this.allow(ctx, PLvl.READ, id);

    // Find daemon
    return await this.getDaemon(id);
  }

  async find(ctx: Context, filter: DaemonFilter = {}): Promise<SimpleDaemon[]> {
    // Has rights
    if (await this.hasRights(ctx, PLvl.READ)) {
      return this.daemonRepo.find(filter);
    }

    // Is a daemon
    if (ctx.daemon) {
      const daemon = await ctx.daemon;
      return this.daemonRepo.find({ ...filter, _id: daemon.id });
    }

    // Is a owner
    if (ctx.user) {
      const user = await ctx.user;
      return this.daemonRepo.find({ ...filter, user: user.id });
    }

    return [];
  }

  async update(ctx: Context, id: string, update: DaemonUpdate): Promise<Daemon> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Get daemon
    let daemon = await this.getDaemon(id);

    // Update daemon
    daemon = await this.daemonRepo.update(daemon, omit(update, ['secret']));
    return this.emitUpdate(daemon);
  }

  async regenerateSecret(ctx: Context, id: string): Promise<DaemonObject> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Get daemon
    let daemon = await this.getDaemon(id);

    // Generate new secret
    const secret = randomString(42);
    await DaemonsService.getTokenRepository(daemon).clear([], false);
    daemon = await this.daemonRepo.update(daemon, { secret });

    this.emitUpdate(daemon);
    return { ...daemon.toObject(), secret }; // Send full daemon with clear secret
  }

  async grant(ctx: Context, id: string, grant: PName, level: PLvl): Promise<Daemon> {
    if (grant === "permissions") { throw HttpError.Forbidden(); }

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Grant permission
    return this.emitUpdate(await this.permissions.grant(ctx, daemon, grant, level));
  }

  async revoke(ctx: Context, id: string, revoke: PName): Promise<Daemon> {
    // Find daemon
    const daemon = await this.getDaemon(id);

    // Revoke permission
    return this.emitUpdate(await this.permissions.revoke(ctx, daemon, revoke));
  }

  async deleteToken(ctx: Context, id: string, tokenId: string): Promise<Daemon> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Get daemon
    const daemon = await this.getDaemon(id);

    // Delete token
    const tokenRepo = DaemonsService.getTokenRepository(daemon);
    const token = tokenRepo.getById(tokenId);

    return this.emitUpdate(
      await tokenRepo.delete(token)
    );
  }

  async delete(ctx: Context, id: string): Promise<Daemon> {
    await this.allow(ctx, PLvl.DELETE, id);

    // Delete daemon
    const daemon = await this.daemonRepo.delete(id);
    if (!daemon) throw HttpError.NotFound(`No daemon found at ${id}`);

    return this.emitDelete(daemon);
  }

  // - authentication
  async login(ctx: Context, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search daemon by credentials
    const daemon = await this.daemonRepo.getByCredentials(credentials);
    if (!daemon) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await this.generateToken(ctx, daemon, false, tags);
    this.emitUpdate(daemon);

    return { _id: token.id, token: token.token, daemon: daemon.id };
  }

  async getByToken(id: string, token: string): Promise<Daemon> {
    const daemon = await this.daemonRepo.getByToken(id, token);
    if (!daemon) throw HttpError.Unauthorized();

    return daemon;
  }

  // - rooms
  async canJoinRoom(ctx: Context, room: string) {
    const id = room === 'daemons' ? null : parseLRN(room)?.id;
    await this.allow(ctx, PLvl.READ, id);
  }
}

export default DaemonsService;
