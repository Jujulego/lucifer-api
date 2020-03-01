import { Request } from 'express';

import { isUserRequest, UserRequest } from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';
import Permissions, { PermissionUpdate } from 'controllers/permissions';
import Tokens, { TokenObj } from 'controllers/tokens';

import { PName, PLvl } from 'data/permission';
import Token from 'data/token';
import User, { Credentials, UserToken, UserCreate, UserFilter, UserUpdate, SimpleUser } from 'data/user';
import UserModel from 'models/user';

import Controller from 'utils/controller';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { user: User['_id'] }

// Class
class UsersController extends Controller {
  // Constructor
  constructor() { super("users"); }

  // Utils
  protected isAllowed(req: Request, level: PLvl, id?: string) {
    if (id && isUserRequest(req) && req.user.id === id) return;
    super.isAllowed(req, level);
  }

  protected async getUser(id: string): Promise<User> {
    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return user;
  }

  // Methods
  async create(req: Request, data: UserCreate): Promise<User> {
    if (req.user) this.isAllowed(req, PLvl.CREATE);

    // Create user
    const user = new UserModel({
      email: data.email,
      password: data.password
    });

    return await user.save();
  }

  async createToken(req: Request, id: string, tags: string[] = []): Promise<TokenObj> {
    this.isAllowed(req, PLvl.UPDATE, id);

    // Generate token
    return Tokens.createToken(req, await this.getUser(id), tags);
  }

  async get(req: Request, id: string): Promise<User> {
    this.isAllowed(req, PLvl.READ, id);

    // Find user
    return await this.getUser(id);
  }

  async find(req: Request, filter: UserFilter = {}): Promise<SimpleUser[]> {
    try {
      this.isAllowed(req, PLvl.READ);

      // Find users
      return UserModel.find(filter, { tokens: false, permissions: false });
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        return req.user ? [req.user] : [];
      }

      throw error;
    }
  }

  async update(req: Request, id: string, update: UserUpdate): Promise<User> {
    this.isAllowed(req, PLvl.UPDATE, id);

    // Find user
    const user = await this.getUser(id);

    // Update user
    const { email, password } = update;
    if (email !== undefined)    user.email    = email;
    if (password !== undefined) user.password = password;

    return await user.save();
  }

  async grant(req: Request, id: string, grant: PermissionUpdate): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Grant permission
    return await Permissions.grant(req, user, grant);
  }

  async elevate(req: Request, id: string, admin?: boolean): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Elevate user
    return await Permissions.elevate(req, user, admin);
  }

  async revoke(req: Request, id: string, revoke: PName): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Revoke permission
    return await Permissions.revoke(req, user, revoke);
  }

  async deleteToken(req: Request, id: string, tokenId: string): Promise<User> {
    this.isAllowed(req, PLvl.UPDATE, id);

    // Delete token
    return await Tokens.deleteToken(req, await this.getUser(id), tokenId);
  }

  async delete(req: Request, id: string): Promise<User> {
    this.isAllowed(req, PLvl.DELETE, id);

    // Find user
    const user = await this.getUser(id);
    return await user.remove();
  }

  async login(req: Request, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search user by credentials
    const user = await UserModel.findByCredentials(credentials);
    if (!user) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await Tokens.login(req, user, tags);
    return { _id: token.id, token: token.token, user: user.id };
  }

  async authenticate(token?: string): Promise<User> {
    return await Tokens.authenticate(token, async (data: UserToken, token: string) => {
      return UserModel.findOne({ _id: data._id, 'tokens.token': token })
    });
  }

  async logout(req: UserRequest) {
    // Remove token
    req.token.remove();
    await req.user.save();
  }
}

// Controller
const Users = new UsersController();
export default Users;
