import { HttpError } from 'middlewares/errors';
import Permissions, { PermissionUpdate } from 'controllers/permissions';
import Tokens, { TokenObj } from 'controllers/tokens';

import { PName, PLvl } from 'data/permission';
import Token from 'data/token';
import User, { Credentials, UserToken, UserCreate, UserFilter, UserUpdate, SimpleUser } from 'data/user';
import UserModel from 'models/user';

import Controller from 'bases/controller';
import Context from 'bases/context';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { user: User['_id'] }

// Class
class UsersController extends Controller {
  // Constructor
  constructor() { super("users"); }

  // Utils
  protected isAllowed(ctx: Context, level: PLvl, id?: string) {
    if (id && ctx.user && ctx.user.id === id) return;

    super.isAllowed(ctx, level);
  }

  protected async getUser(id: string): Promise<User> {
    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return user;
  }

  // Methods
  async create(ctx: Context, data: UserCreate): Promise<User> {
    if (ctx.user) this.isAllowed(ctx, PLvl.CREATE);

    // Create user
    const user = new UserModel({
      email: data.email,
      password: data.password
    });

    return await user.save();
  }

  async createToken(ctx: Context, id: string, tags: string[] = []): Promise<TokenObj> {
    this.isAllowed(ctx, PLvl.UPDATE, id);

    // Generate token
    return Tokens.createToken(ctx, await this.getUser(id), tags);
  }

  async get(ctx: Context, id: string): Promise<User> {
    this.isAllowed(ctx, PLvl.READ, id);

    // Find user
    return await this.getUser(id);
  }

  async find(ctx: Context, filter: UserFilter = {}): Promise<SimpleUser[]> {
    try {
      this.isAllowed(ctx, PLvl.READ);

      // Find users
      return UserModel.find(filter, { tokens: false, permissions: false });
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        return ctx.user ? [ctx.user] : [];
      }

      throw error;
    }
  }

  async update(ctx: Context, id: string, update: UserUpdate): Promise<User> {
    this.isAllowed(ctx, PLvl.UPDATE, id);

    // Find user
    const user = await this.getUser(id);

    // Update user
    const { email, password } = update;
    if (email !== undefined)    user.email    = email;
    if (password !== undefined) user.password = password;

    return await user.save();
  }

  async grant(ctx: Context, id: string, grant: PermissionUpdate): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Grant permission
    return await Permissions.grant(ctx, user, grant);
  }

  async elevate(ctx: Context, id: string, admin?: boolean): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Elevate user
    return await Permissions.elevate(ctx, user, admin);
  }

  async revoke(ctx: Context, id: string, revoke: PName): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Revoke permission
    return await Permissions.revoke(ctx, user, revoke);
  }

  async deleteToken(ctx: Context, id: string, tokenId: string): Promise<User> {
    this.isAllowed(ctx, PLvl.UPDATE, id);

    // Delete token
    return await Tokens.deleteToken(ctx, await this.getUser(id), tokenId);
  }

  async delete(ctx: Context, id: string): Promise<User> {
    this.isAllowed(ctx, PLvl.DELETE, id);

    // Find user
    const user = await this.getUser(id);
    return await user.remove();
  }

  async login(ctx: Context, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search user by credentials
    const user = await UserModel.findByCredentials(credentials);
    if (!user) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await Tokens.login(ctx, user, tags);
    return { _id: token.id, token: token.token, user: user.id };
  }

  async authenticate(token?: string): Promise<User> {
    return await Tokens.authenticate(token, async (data: UserToken, token: string) => {
      return UserModel.findOne({ _id: data._id, 'tokens.token': token })
    });
  }

  async logout(ctx: Context) {
    await Tokens.logout(ctx);
  }
}

// Controller
const Users = new UsersController();
export default Users;
