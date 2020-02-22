import { Request } from 'express';
import moment from 'moment';

import { HttpError } from 'middlewares/errors';

import { isAllowed, PermissionName, PermissionLevel } from 'data/permission';
import Token, { verifyToken } from 'data/token';
import User, { Credentials, UserToken } from 'data/user';
import UserModel from 'models/user';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { user: User['_id'] }

export type UserFilter = Partial<Omit<User, 'password' | 'tokens'>>
export type UserUpdate = Partial<Omit<User, '_id' | 'lastConnexion' | 'permissions' | 'tokens'>>

export interface PermissionGrant {
  name: PermissionName, level: number
}

// Controller
const Users = {
  // Utils
  isAllowed(req: Request, level: PermissionLevel, id?: string) {
    if (id && req.user.id === id) return;
    if (!isAllowed(req.user, "users", level)) {
      throw HttpError.Forbidden('Not allowed');
    }
  },

  // Methods
  async create(req: Request, cred: Credentials): Promise<User> {
    if (req.user) this.isAllowed(req, PermissionLevel.CREATE);

    // Create user
    let user = new UserModel({
      email: cred.email,
      password: cred.password
    });

    return user.save();
  },

  async createToken(req: Request, id: string, tags: string[] = []): Promise<Token> {
    this.isAllowed(req, PermissionLevel.UPDATE, id);

    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    // Generate token
    const token = await user.generateToken(req);
    token.tags.push(...tags);

    await user.save();
    return token.toObject(); // /!\: returns the token too !
  },

  async get(req: Request, id: string): Promise<User> {
    this.isAllowed(req, PermissionLevel.READ, id);

    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return user;
  },

  async update(req: Request, id: string, update: UserUpdate): Promise<User> {
    this.isAllowed(req, PermissionLevel.UPDATE, id);

    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    // Update user
    const { email, password } = update;
    if (email !== undefined)    user.email    = email;
    if (password !== undefined) user.password = password;

    return await user.save();
  },

  async grant(req: Request, id: string, grant: PermissionGrant): Promise<User> {
    this.isAllowed(req, PermissionLevel.UPDATE, id);

    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    // Update user
    let permission = user.permissions.find(p => p.name === grant.name);
    if (permission) {
      permission.level = permission.level | grant.level;
    } else {
      permission = user.permissions.create({ name: grant.name, level: grant.level });
      user.permissions.push(permission);
    }

    return await user.save();
  },

  async deleteToken(req: Request, id: string, tokenId: string): Promise<User> {
    this.isAllowed(req, PermissionLevel.UPDATE, id);

    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    // Find token
    const token = user.tokens.id(tokenId);
    await token.remove();

    return await user.save();
  },

  async delete(req: Request, id: string): Promise<User> {
    this.isAllowed(req, PermissionLevel.DELETE, id);

    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return await user.remove();
  },

  async find(req: Request, filter: UserFilter = {}): Promise<User[]> {
    try {
      this.isAllowed(req, PermissionLevel.READ);

      // Find users
      return UserModel.find(filter);
    } catch (error) {
      if (error instanceof HttpError && error.code === 403) {
        return [req.user];
      }

      throw error;
    }
  },

  async login(req: Request, credentials: Credentials, tags: string[] = []): Promise<LoginToken> {
    // Search user by credentials
    const user = await UserModel.findByCredentials(credentials);
    if (!user) throw HttpError.Unauthorized("Login failed");

    user.lastConnexion = moment().utc().toDate();

    // Generate token
    const token = await user.generateToken(req);
    token.tags.push(...tags);
    await user.save();

    return { _id: token.id, token: token.token, user: user.id };
  },

  async authenticate(token?: string): Promise<User> {
    // Decode token
    if (!token) throw HttpError.Unauthorized();
    const data = verifyToken<UserToken>(token);

    // Find user
    const user = await UserModel.findOne({ _id: data._id, 'tokens.token': token });
    if (!user) throw HttpError.Unauthorized();

    return user;
  },

  async logout(req: Request) {
    // Remove token
    req.token.remove();
    await req.user.save();
  },
};

export default Users;