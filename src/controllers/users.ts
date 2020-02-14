import { Request } from 'express';

import { HttpError } from 'middlewares/errors';

import Token, { verifyToken } from 'data/token';
import User, { Credentials, UserToken } from 'data/user';
import UserModel from 'models/user';

// Types
export type LoginToken = Pick<Token, '_id' | 'token'> & { user: User['_id'] }

export type UserFilter = Partial<Omit<User, 'password' | 'tokens'>>
export type UserUpdate = Partial<Omit<User, 'tokens'>>

// Controller
const Users = {
  // Methods
  async create(req: Request, cred: Credentials): Promise<User> {
    // Create user
    let user = new UserModel({
      email: cred.email,
      password: cred.password
    });

    return user.save();
  },

  async get(req: Request, id: string): Promise<User> {
    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return user;
  },

  async update(req: Request, id: string, update: UserUpdate): Promise<User> {
    // Find user
    let user = await this.get(req, id);

    // Update user
    const { email, password } = update;
    if (email !== undefined)    user.email    = email;
    if (password !== undefined) user.password = password;

    return await user.save();
  },

  async delete(req: Request, id: string): Promise<User> {
    // Find user
    const user = await UserModel.findById(id);
    if (!user) throw HttpError.NotFound(`No user found at ${id}`);

    return await user.remove();
  },

  async find(req: Request, filter: UserFilter = {}): Promise<User[]> {
    // Find users
    return UserModel.find(filter);
  },

  async login(req: Request, credentials: Credentials): Promise<LoginToken> {
    // Search user by credentials
    const user = await UserModel.findByCredentials(credentials);
    if (!user) throw HttpError.Unauthorized("Login failed");

    // Generate token
    const token = await user.generateToken(req);
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