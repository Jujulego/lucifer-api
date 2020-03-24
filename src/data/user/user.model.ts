import mongoose from 'mongoose';

import { User } from './user';
import UserSchema from './user.schema';

// Model
const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;
