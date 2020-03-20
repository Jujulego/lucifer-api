import bcrypt from 'bcryptjs';
import { omit } from 'lodash';
import { Schema } from 'mongoose';
import validator from 'validator';

import { PermissionHolderDef } from 'data/permission/permission.holder';
import { TokenHolderDef } from 'data/token/token.holder';

import { buildLRN } from 'utils';

import { User } from './user.types';

// Schema
const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true, lowercase: true, validate: validator.isEmail },
  password: { type: String, required: true },
});

UserSchema.add(PermissionHolderDef);
UserSchema.add(TokenHolderDef);

// Virtuals
UserSchema.virtual('lrn').get(function (this: User) {
  return buildLRN({ type: 'user', id: this.id });
});

// Options
UserSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => omit(ret, ['password'])
});

// Events
UserSchema.pre<User>('save', async function (next) {
  // Hash password before saving
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

export default UserSchema;
