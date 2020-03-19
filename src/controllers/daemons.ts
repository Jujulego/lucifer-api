import { injectable, inject } from 'inversify';
import { Document } from 'mongoose';

import { HttpError } from 'middlewares/errors';
import PermissionsController, { PermissionUpdate } from 'controllers/permissions';

import Controller from 'bases/controller';
import Context from 'bases/context';

import { Token, TokenObj } from 'data/token/token.types';
import TokenRepository from 'data/token/token.repository';

import TokensService from 'services/tokens.service';

import { parseLRN } from 'utils/lrn';
import { randomString } from 'utils/string';

import Daemon, {
  DaemonToken, SimpleDaemon, Credentials,
  DaemonFilter, DaemonCreate, DaemonUpdate,
  simplifyDaemon
} from 'data/daemon';
import { PLvl, PName } from 'data/permission';
import DaemonModel from 'models/daemon';

// Types
export type DaemonObject = Omit<Daemon, keyof Document>
export type LoginToken = Pick<Token, '_id' | 'token'> & { daemon: Daemon['_id'] }

// Controller
@injectable()
class DaemonsController extends Controller<Daemon> {
  // Attributes
  protected readonly permission: "daemons" = "daemons";

  private readonly tokenRepo = new TokenRepository<Daemon>();

  // Constructor
  constructor(
    @inject(PermissionsController) private permissions: PermissionsController,
    @inject(TokensService) private tokens: TokensService
  ) { super(); }

  // Utils
  protected async isAllowed(ctx: Context, level: PLvl, id?: string | null) {
    if (id) {
      if (ctx.daemon && (await ctx.daemon).id === id) return;
      if (ctx.user) {
        if (await DaemonModel.findOne({ _id: id, user: (await ctx.user).id })) return;
      }
    }

    await super.isAllowed(ctx, level);
  }

  protected async getDaemon(id: string): Promise<Daemon> {
    // Find daemon
    const daemon = await DaemonModel.findById(id);
    if (!daemon) throw HttpError.NotFound(`No daemon found at ${id}`);

    return daemon;
  }

  protected getTargets(data: Daemon) {
    return {
      [data.lrn]: (data: Daemon) => data.toJSON(),
      daemons: simplifyDaemon
    };
  }

  // Methods
  async create(ctx: Context, data: DaemonCreate): Promise<DaemonObject> {
    await this.isAllowed(ctx, PLvl.CREATE);

    // Create daemon
    const secret = randomString(40);
    const daemon = new DaemonModel({
      name: data.name,
      secret,
      user: data.user,
    });

    this.emitCreate(await daemon.save());
    return { ...daemon.toObject(), secret }; // Send full daemon with clear secret
  }

  async createToken(ctx: Context, id: string, tags: string[] = []): Promise<TokenObj> {
    await this.isAllowed(ctx, PLvl.UPDATE, id);

    // Generate token
    const daemon = await this.getDaemon(id);
    const token = await this.tokenRepo.createToken(daemon, ctx, { _id: daemon.id }, false, '7 days', tags);
    this.emitUpdate(daemon);

    return token.toObject();
  }

  async get(ctx: Context, id: string): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.READ, id);

    // Find daemon
    return await this.getDaemon(id);
  }

  async find(ctx: Context, filter: DaemonFilter = {}): Promise<SimpleDaemon[]> {
    try {
      await this.isAllowed(ctx, PLvl.READ);

      // Find users
      return DaemonModel.find(filter, { permissions: false, tokens: false });
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        if (ctx.daemon) return [await ctx.daemon];
        if (ctx.user) {
          return DaemonModel.find(
            { ...filter, user: (await ctx.user).id },
            { permissions: false, tokens: false }
            );
        }

        return [];
      }

      throw error;
    }
  }

  async update(ctx: Context, id: string, update: DaemonUpdate): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.UPDATE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Update daemon
    const { name, user } = update;
    if (name !== undefined) daemon.name = name;
    if (user !== undefined) daemon.user = user;

    return this.emitUpdate(await daemon.save());
  }

  async grant(ctx: Context, id: string, grant: PermissionUpdate): Promise<Daemon> {
    if (grant.name === "permissions") { throw HttpError.Forbidden(); }

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Grant permission
    return this.emitUpdate(await this.permissions.grant(ctx, daemon, grant));
  }

  async revoke(ctx: Context, id: string, revoke: PName): Promise<Daemon> {
    // Find daemon
    const daemon = await this.getDaemon(id);

    // Revoke permission
    return this.emitUpdate(await this.permissions.revoke(ctx, daemon, revoke));
  }

  async deleteToken(ctx: Context, id: string, tokenId: string): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.UPDATE, id);

    // Delete token
    const daemon = await this.getDaemon(id);
    const token = await this.tokenRepo.getToken(daemon, tokenId);

    return this.emitUpdate(
      await this.tokenRepo.deleteToken(daemon, token)
    );
  }

  async delete(ctx: Context, id: string): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.DELETE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);
    return this.emitDelete(await daemon.remove());
  }

  // - authentication
  async login(ctx: Context, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search daemon by credentials
    const daemon = await DaemonModel.findByCredentials(credentials);
    if (!daemon) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await this.tokenRepo.createToken(daemon, ctx, { _id: daemon.id }, true, '7 days', tags);
    this.emitUpdate(daemon);

    return { _id: token.id, token: token.token, daemon: daemon.id };
  }

  async authenticate(token?: string): Promise<Daemon> {
    return await this.tokens.authenticate(token, async (data: DaemonToken, token: string) => {
      return DaemonModel.findOne({ _id: data._id, 'tokens.token': token });
    });
  }

  async logout(ctx: Context) {
    if (ctx.daemon) {
      const daemon = await ctx.daemon;
      const token = await ctx.token!;

      await this.tokenRepo.deleteToken(daemon, token);
    }
  }

  // - rooms
  async canJoinRoom(ctx: Context, room: string) {
    const id = room === 'daemons' ? null : parseLRN(room)?.id;
    await this.isAllowed(ctx, PLvl.READ, id);
  }
}

export default DaemonsController;
