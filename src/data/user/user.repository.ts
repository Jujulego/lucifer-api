import bcrypt from 'bcryptjs';

import UserModel from './user.model';
import { Credentials, SimpleUser, User } from './user';
import { UserCreate, UserFilter, UserUpdate } from './user';

// Repository
class UserRepository {
  // Methods
  async create(data: UserCreate): Promise<User> {
    // Create user
    const user = new UserModel({
      email: data.email,
      password: data.password
    });

    return await user.save();
  }

  async getById(id: string): Promise<User | null> {
    return UserModel.findById(id);
  }

  async getByCredentials(credentials: Credentials): Promise<User | null> {
    // Search by email
    const user = await UserModel.findOne({ email: credentials.email });
    if (!user) return null;

    // Check password
    const match = await bcrypt.compare(credentials.password, user.password);
    if (!match) return null;

    return user;
  }

  async getByToken(id: string, token: string): Promise<User | null> {
    return UserModel.findOne({ _id: id, 'tokens.token': token });
  }

  async find(filter: UserFilter): Promise<SimpleUser[]> {
    return UserModel.find(filter, { tokens: false, permissions: false });
  }

  async update(id: string, update: UserUpdate): Promise<User | null> {
    return UserModel.findByIdAndUpdate(id, { $set: update });
  }

  async delete(id: string): Promise<User | null> {
    return UserModel.findByIdAndDelete(id);
  }
}

export default UserRepository;
