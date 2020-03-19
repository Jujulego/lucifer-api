import { injectable, inject } from 'inversify';

import { HttpError } from 'middlewares/errors';

import { DataEmitter } from 'bases/data';
import Context from 'bases/context';

import { PName, PLvl } from 'data/permission/permission.enums';
import { Token, TokenObj } from 'data/token/token.types';
import TokenRepository from 'data/token/token.repository';

import AuthorizeService from 'services/authorize.service';
import PermissionsService from 'services/permissions.service';
import TokensService from 'services/tokens.service';

import { parseLRN } from 'utils/lrn';

import User, {
  Credentials, SimpleUser, UserToken,
  UserCreate, UserFilter, UserUpdate,
  simplifyUser
} from 'data/user';
import UserModel from 'models/user';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { user: User['_id'] }

// Controller
@injectable()
class UsersController extends DataEmitter<User> {
  // Attributes
  private readonly tokenRepo = new TokenRepository<User>();

  // Constructor
  constructor(
    @inject(AuthorizeService) private authorizer: AuthorizeService,
    @inject(PermissionsService) private permissions: PermissionsService,
    @inject(TokensService) private tokens: TokensService
  ) { super(); }

  // Utils
  protected async allow(ctx: Context, level: PLvl, id?: string | null) {
    if (id && ctx.user && (await ctx.user).id === id) return;

    await this.authorizer.allow(ctx, "users", level);
  }

  protected async getUser(id: string): Promise<User> {
    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return user;
  }

  protected getTargets(data: User) {
    return {
      [data.lrn]: (data: User) => data.toJSON(),
      users: simplifyUser
    };
  }

  // Methods
  async create(ctx: Context, data: UserCreate): Promise<User> {
    if (ctx.user) await this.allow(ctx, PLvl.CREATE);

    // Create user
    const user = new UserModel({
      email: data.email,
      password: data.password
    });

    return this.emitCreate(await user.save());
  }

  async createToken(ctx: Context, id: string, tags: string[] = []): Promise<TokenObj> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Generate token
    const user = await this.getUser(id);
    const token = await this.tokenRepo.createToken(user, ctx, { _id: user.id }, false, '7 days', tags);
    this.emitUpdate(user);

    return token;
  }

  async get(ctx: Context, id: string): Promise<User> {
    await this.allow(ctx, PLvl.READ, id);

    // Find user
    return await this.getUser(id);
  }

  async find(ctx: Context, filter: UserFilter = {}): Promise<SimpleUser[]> {
    try {
      await this.allow(ctx, PLvl.READ);

      // Find users
      return UserModel.find(filter, { tokens: false, permissions: false });
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        return ctx.user ? [await ctx.user] : [];
      }

      throw error;
    }
  }

  async update(ctx: Context, id: string, update: UserUpdate): Promise<User> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Find user
    const user = await this.getUser(id);

    // Update user
    const { email, password } = update;
    if (email !== undefined)    user.email    = email;
    if (password !== undefined) user.password = password;

    return this.emitUpdate(await user.save());
  }

  async grant(ctx: Context, id: string, grant: PName, level: PLvl): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Grant permission
    return this.emitUpdate(await this.permissions.grant(ctx, user, grant, level));
  }

  async elevate(ctx: Context, id: string, admin?: boolean): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Elevate user
    return this.emitUpdate(await this.permissions.elevate(ctx, user, admin));
  }

  async revoke(ctx: Context, id: string, revoke: PName): Promise<User> {
    // Find user
    const user = await this.getUser(id);

    // Revoke permission
    return this.emitUpdate(await this.permissions.revoke(ctx, user, revoke));
  }

  async deleteToken(ctx: Context, id: string, tokenId: string): Promise<User> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Delete token
    const user = await this.getUser(id);
    const token = await this.tokenRepo.getToken(user, tokenId);

    return this.emitUpdate(
      await this.tokenRepo.deleteToken(user, token)
    );
  }

  async delete(ctx: Context, id: string): Promise<User> {
    await this.allow(ctx, PLvl.DELETE, id);

    // Find user
    const user = await this.getUser(id);
    return this.emitDelete(await user.remove());
  }

  // - authentication
  async login(ctx: Context, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search user by credentials
    const user = await UserModel.findByCredentials(credentials);
    if (!user) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await this.tokenRepo.createToken(user, ctx, { _id: user.id }, true, '7 days', tags);
    this.emitUpdate(user);

    return { _id: token.id, token: token.token, user: user.id };
  }

  async authenticate(token?: string): Promise<User> {
    return await this.tokens.authenticate(token, async (data: UserToken, token: string) => {
      return UserModel.findOne({ _id: data._id, 'tokens.token': token })
    });
  }

  async getByToken(id: string, token: string): Promise<User> {
    const user = await UserModel.findOne({ _id: id, 'tokens.token': token });
    if (!user) throw HttpError.Unauthorized();

    return user;
  }

  // - rooms
  async canJoinRoom(ctx: Context, room: string) {
    const id = room === 'users' ? null : parseLRN(room)?.id;
    await this.allow(ctx, PLvl.READ, id);
  }
}

export default UsersController;
