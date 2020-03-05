import { HttpError } from 'middlewares/errors';
import Permissions, { PermissionUpdate } from 'controllers/permissions';
import Tokens, { TokenObj } from 'controllers/tokens';

import Daemon, { DaemonToken, SimpleDaemon, DaemonFilter, DaemonCreate, DaemonUpdate } from 'data/daemon';
import { PLvl, PName } from 'data/permission';
import DaemonModel from 'models/daemon';

import Controller from 'bases/controller';
import Context from 'bases/context';
import { randomString } from 'utils/string';

// Class
class DaemonsController extends Controller {
  // Constructor
  constructor() { super("daemons"); }

  // Utils
  protected async isAllowed(ctx: Context, level: PLvl, id?: string) {
    if (id) {
      if (ctx.daemon && ctx.daemon.id === id) return;
      if (ctx.user) {
        if (await DaemonModel.findOne({ _id: id, user: ctx.user.id })) return;
      }
    }

    super.isAllowed(ctx, level);
  }

  protected async getDaemon(id: string): Promise<Daemon> {
    // Find daemon
    const daemon = await DaemonModel.findById(id);
    if (!daemon) throw HttpError.NotFound(`No daemon found at ${id}`);

    return daemon;
  }

  // Methods
  async create(ctx: Context, data: DaemonCreate): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.CREATE);

    // Create daemon
    const daemon = new DaemonModel({
      name: data.name,
      secret: randomString(40),
      user: data.user,
    });

    return await daemon.save();
  }

  async createToken(ctx: Context, id: string, tags: string[] = []): Promise<TokenObj> {
    await this.isAllowed(ctx, PLvl.UPDATE, id);

    // Generate token
    return Tokens.createToken(ctx, await this.getDaemon(id), tags);
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
        if (ctx.daemon) return [ctx.daemon];
        if (ctx.user) {
          return DaemonModel.find(
            { ...filter, user: ctx.user.id },
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

    return await daemon.save();
  }

  async grant(ctx: Context, id: string, grant: PermissionUpdate): Promise<Daemon> {
    if (grant.name === "permissions") { throw HttpError.Forbidden(); }

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Grant permission
    return await Permissions.grant(ctx, daemon, grant);
  }

  async revoke(ctx: Context, id: string, revoke: PName): Promise<Daemon> {
    // Find daemon
    const daemon = await this.getDaemon(id);

    // Revoke permission
    return await Permissions.revoke(ctx, daemon, revoke);
  }

  async deleteToken(ctx: Context, id: string, tokenId: string): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.UPDATE, id);

    // Delete token
    return Tokens.deleteToken(ctx, await this.getDaemon(id), tokenId);
  }

  async delete(ctx: Context, id: string): Promise<Daemon> {
    await this.isAllowed(ctx, PLvl.DELETE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);
    return await daemon.remove();
  }

  async authenticate(token?: string): Promise<Daemon> {
    return await Tokens.authenticate(token, async (data: DaemonToken, token: string) => {
      return DaemonModel.findOne({ _id: data._id, 'tokens.token': token });
    });
  }

  async logout(ctx: Context) {
    await Tokens.logout(ctx);
  }
}

// Controller
const Daemons = new DaemonsController();
export default Daemons;
