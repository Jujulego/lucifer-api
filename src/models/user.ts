import mongoose, { Model } from 'mongoose';

import User, { Credentials } from 'data/user';
import UserSchema from 'schemas/user';

// Interface;
interface UserModel extends Model<User> {
  // Methods
  findByCredentials(credentials: Credentials): Promise<User | null>
}

// Model
const UserModel = mongoose.model<User, UserModel>('User', UserSchema);

export default UserModel;