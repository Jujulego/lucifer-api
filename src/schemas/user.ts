import { Schema } from 'mongoose';

import bcrypt from 'bcryptjs';
import validator from 'validator';
import { omit } from 'lodash';

import Context from 'bases/context';
import { buildLRN } from 'utils/lrn';

import { generateToken } from 'data/token';
import User, { Credentials, UserToken } from 'data/user';

import { PermissionHolderDef } from './permission';
import { TokenHolderDef } from './token';

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

// Methods
UserSchema.methods.generateToken = async function(ctx: Context) {
  return generateToken(this, ctx, { _id: this.id } as UserToken, '7 days');
};

// Statics
UserSchema.statics.findByCredentials = async function(cred: Credentials): Promise<User | null> {
  // Search by email
  const user = await this.findOne({ email: cred.email });
  if (!user) return null;

  // Check password
  const match = await bcrypt.compare(cred.password, user.password);
  if (!match) return null;

  return user;
};

export default UserSchema;
