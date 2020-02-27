import { Request } from 'express';
import moment from 'moment';

import { DaemonRequest, isDaemonRequest } from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';
import Permissions, { PermissionUpdate } from 'controllers/permissions';

import Daemon, { Credentials, DaemonToken } from 'data/daemon';
import { PLvl, PName } from 'data/permission';
import Token, { verifyToken } from 'data/token';
import DaemonModel from 'models/daemon';

import Controller from 'utils/controller';
import { randomString } from 'utils/string';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { daemon: Daemon['_id'] }

export type DaemonFilter = Partial<Omit<Daemon, 'secret' | 'permissions' | 'tokens'>>
export type DaemonUpdate = Partial<Pick<Daemon, 'name'>>

// Class
class DaemonsController extends Controller {
  // Constructor
  constructor() { super("daemons"); }

  // Utils
  protected isAllowed(req: Request, level: PLvl, id?: string) {
    if (id && isDaemonRequest(req) && req.daemon.id === id) return;
    super.isAllowed(req, level);
  }

  protected async getDaemon(id: string): Promise<Daemon> {
    // Find daemon
    const daemon = await DaemonModel.findById(id);
    if (!daemon) throw HttpError.NotFound(`No daemon found at ${id}`);

    return daemon;
  }

  // Methods
  async create(req: Request, data: DaemonUpdate): Promise<Daemon> {
    this.isAllowed(req, PLvl.CREATE);

    // Create daemon
    const daemon = new DaemonModel({
      name: data.name,
      secret: randomString(40)
    });

    return await daemon.save();
  }

  async createToken(req: Request, id: string, tags: string[] = []): Promise<Token> {
    this.isAllowed(req, PLvl.UPDATE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Generate token
    const token = await daemon.generateToken(req);
    token.tags.push(...tags);

    await daemon.save();
    return token.toObject(); // /!\: returns the token too !
  }

  async get(req: Request, id: string): Promise<Daemon> {
    this.isAllowed(req, PLvl.READ, id);

    // Find daemon
    return await this.getDaemon(id);
  }

  async find(req: Request, filter: DaemonFilter = {}): Promise<Daemon[]> {
    try {
      this.isAllowed(req, PLvl.READ);

      // Find users
      return DaemonModel.find(filter);
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        return req.daemon ? [req.daemon] : [];
      }

      throw error;
    }
  }

  async update(req: Request, id: string, update: DaemonUpdate): Promise<Daemon> {
    this.isAllowed(req, PLvl.UPDATE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Update daemon
    const { name } = update;
    if (name !== undefined) daemon.name = name;

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
    this.isAllowed(req, PLvl.UPDATE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);

    // Find token
    const token = daemon.tokens.id(tokenId);
    await token.remove();

    return await daemon.save();
  }

  async delete(req: Request, id: string): Promise<Daemon> {
    this.isAllowed(req, PLvl.DELETE, id);

    // Find daemon
    const daemon = await this.getDaemon(id);
    return await daemon.remove();
  }

  async login(req: Request, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search daemon by credentials
    const daemon = await DaemonModel.findByCredentials(credentials);
    if (!daemon) throw HttpError.Unauthorized("Login failed");

    daemon.lastConnexion = moment().utc().toDate();

    // Generate token
    const token = await daemon.generateToken(req);
    token.tags.push(...tags);
    await daemon.save();

    return { _id: token.id, token: token.token, daemon: daemon.id };
  }

  async authenticate(token?: string): Promise<Daemon> {
    // Decode token
    if (!token) throw HttpError.Unauthorized();
    let data: DaemonToken;

    try {
      data = verifyToken<DaemonToken>(token);
    } catch (error) {
      console.error(error);
      throw HttpError.Unauthorized();
    }

    // Find user
    const user = await DaemonModel.findOne({ _id: data._id, 'tokens.token': token });
    if (!user) throw HttpError.Unauthorized();

    return user;
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
