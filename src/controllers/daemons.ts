import { Request } from 'express';

import { DaemonRequest, isDaemonRequest, isUserRequest } from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';
import Permissions, { PermissionUpdate } from 'controllers/permissions';
import Tokens, { TokenObj } from 'controllers/tokens';

import Daemon, { DaemonToken, SimpleDaemon, DaemonFilter, DaemonCreate, DaemonUpdate } from 'data/daemon';
import { PLvl, PName } from 'data/permission';
import DaemonModel from 'models/daemon';

import Controller from 'utils/controller';
import { randomString } from 'utils/string';

// Class
class DaemonsController extends Controller {
  // Constructor
  constructor() { super("daemons"); }

  // Utils
  protected async isAllowed(req: Request, level: PLvl, id?: string) {
    if (id) {
      if (isDaemonRequest(req) && req.daemon.id === id) return;
      if (isUserRequest(req)) {
        if (await DaemonModel.findOne({ _id: id, user: req.user.id })) return;
      }
    }

    super.isAllowed(req, level);
  }

  protected async getDaemon(id: string): Promise<Daemon> {
    // Find daemon
    const daemon = await DaemonModel.findById(id);
    if (!daemon) throw HttpError.NotFound(`No daemon found at ${id}`);

    return daemon;
  }

  // Methods
  async create(req: Request, data: DaemonCreate): Promise<Daemon> {
    await this.isAllowed(req, PLvl.CREATE);

    // Create daemon
    const daemon = new DaemonModel({
      name: data.name,
      secret: randomString(40),
      user: data.user,
    });

    return await daemon.save();
  }

  async createToken(req: Request, id: string, tags: string[] = []): Promise<TokenObj> {
    await this.isAllowed(req, PLvl.UPDATE, id);

    // Generate token
    return Tokens.createToken(req, await this.getDaemon(id), tags);
  }

  async get(req: Request, id: string): Promise<Daemon> {
    await this.isAllowed(req, PLvl.READ, id);

    // Find daemon
    return await this.getDaemon(id);
  }

  async find(req: Request, filter: DaemonFilter = {}): Promise<SimpleDaemon[]> {
    try {
      await this.isAllowed(req, PLvl.READ);

      // Find users
      return DaemonModel.find(filter, { permissions: false, tokens: false });
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        if (isDaemonRequest(req)) return [req.daemon];
        if (isUserRequest(req)) {
          return DaemonModel.find(
            { ...filter, user: req.user.id },
            { permissions: false, tokens: false }
            );
        }

        return [];
      }

      throw error;
    }
  }

  async update(req: Request, id: string, update: DaemonUpdate): Promise<Daemon> {
    await this.isAllowed(req, PLvl.UPDATE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Update daemon
    const { name, user } = update;
    if (name !== undefined) daemon.name = name;
    if (user !== undefined) daemon.user = user;

    return await daemon.save();
  }

  async grant(req: Request, id: string, grant: PermissionUpdate): Promise<Daemon> {
    if (grant.name === "permissions") { throw HttpError.Forbidden(); }

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Grant permission
    return await Permissions.grant(req, daemon, grant);
  }

  async revoke(req: Request, id: string, revoke: PName): Promise<Daemon> {
    // Find daemon
    const daemon = await this.getDaemon(id);

    // Revoke permission
    return await Permissions.revoke(req, daemon, revoke);
  }

  async deleteToken(req: Request, id: string, tokenId: string): Promise<Daemon> {
    await this.isAllowed(req, PLvl.UPDATE, id);

    // Delete token
    return Tokens.deleteToken(req, await this.getDaemon(id), tokenId);
  }

  async delete(req: Request, id: string): Promise<Daemon> {
    await this.isAllowed(req, PLvl.DELETE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);
    return await daemon.remove();
  }

  async authenticate(token?: string): Promise<Daemon> {
    return await Tokens.authenticate(token, async (data: DaemonToken, token: string) => {
      return DaemonModel.findOne({ _id: data._id, 'tokens.token': token });
    });
  }

  async logout(req: DaemonRequest) {
    // Remove token
    req.token.remove();
    await req.daemon.save();
  }
}

// Controller
const Daemons = new DaemonsController();
export default Daemons;
