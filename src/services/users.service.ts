import { omit } from 'lodash';

import { HttpError } from 'middlewares/errors';

import { DataEmitter } from 'bases/data';
import Context from 'bases/context';

import { PName, PLvl } from 'data/permission/permission.enums';
import { Token, TokenObj } from 'data/token/token';
import TokenRepository from 'data/token/token.repository';
import { User, Credentials, SimpleUser } from 'data/user/user';
import { UserCreate, UserFilter, UserUpdate } from 'data/user/user';
import UserRepository from 'data/user/user.repository';

import ApiEventService from 'services/api-event.service';
import AuthorizeService from 'services/authorize.service';
import PermissionsService from 'services/permissions.service';

import { Service, parseLRN } from 'utils';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { user: User['_id'] }

// Controller
@Service(UsersService)
class UsersService extends DataEmitter<User> {
  // Attributes
  private readonly tokenRepo = new TokenRepository<User>();
  private readonly userRepo = new UserRepository();

  // Constructor
  constructor(
    apievents: ApiEventService,
    private authorizer: AuthorizeService,
    private permissions: PermissionsService,
  ) { super(apievents); }

  // Utils
  private static simplifyUser(user: User): SimpleUser {
    return omit(user, ['permissions', 'tokens']);
  }

  protected async allow(ctx: Context, level: PLvl, id?: string | null) {
    if (id && ctx.user && (await ctx.user).id === id) return;

    await this.authorizer.allow(ctx, "users", level);
  }

  protected async getUser(id: string): Promise<User> {
    // Find user
    const user = await this.userRepo.getById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return user;
  }

  protected getTargets(data: User) {
    return {
      [data.lrn]: (data: User) => data.toJSON(),
      users: UsersService.simplifyUser
    };
  }

  protected async generateToken(ctx: Context, user: User, login: boolean, tags: string[]): Promise<Token> {
    return await this.tokenRepo.createToken(
      user, ctx, { lrn: user.lrn },
      login, '7 days', tags
    );
  }

  // Methods
  async create(ctx: Context, data: UserCreate): Promise<User> {
    if (ctx.user) await this.allow(ctx, PLvl.CREATE);

    // Create user
    return this.emitCreate(await this.userRepo.create(data));
  }

  async createToken(ctx: Context, id: string, tags: string[] = []): Promise<TokenObj> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Generate token
    const user = await this.getUser(id);
    const token = await this.generateToken(ctx, user, false, tags);
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
      return this.userRepo.find(filter);
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        return ctx.user ? [await ctx.user] : [];
      }

      throw error;
    }
  }

  async update(ctx: Context, id: string, update: UserUpdate): Promise<User> {
    await this.allow(ctx, PLvl.UPDATE, id);

    // Get user
    let user = await this.getUser(id);

    // Update user
    user = await this.userRepo.update(user, update);
    return this.emitUpdate(user);
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

    // Delete user
    const user = await this.userRepo.delete(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return this.emitDelete(user);
  }

  // - authentication
  async login(ctx: Context, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search user by credentials
    const user = await this.userRepo.getByCredentials(credentials);
    if (!user) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await this.generateToken(ctx, user, false, tags);
    this.emitUpdate(user);

    return { _id: token.id, token: token.token, user: user.id };
  }

  async getByToken(id: string, token: string): Promise<User> {
    const user = await this.userRepo.getByToken(id, token);
    if (!user) throw HttpError.Unauthorized();

    return user;
  }

  // - rooms
  async canJoinRoom(ctx: Context, room: string) {
    const id = room === 'users' ? null : parseLRN(room)?.id;
    await this.allow(ctx, PLvl.READ, id);
  }
}

export default UsersService;
