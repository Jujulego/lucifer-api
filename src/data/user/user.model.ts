import mongoose from 'mongoose';

import { User } from './user.types';
import UserSchema from './user.schema';

// Model
const UserModel = mongoose.model<User>('User', UserSchema);

export default UserModel;
