import { Request } from 'express';
import { Schema } from 'mongoose';

import bcrypt from 'bcryptjs';
import moment from 'moment';
import validator from 'validator';
import _ from 'lodash';

import { generateToken } from 'data/token';
import User, { Credentials } from 'data/user';

import { PermissionHolderDef } from './permission';
import TokenSchema from './token';

// Schema
const UserSchema = new Schema<User>({
  email: { type: String, required: true, unique: true, lowercase: true, validate: validator.isEmail },
  password: { type: String, required: true },
  lastConnexion: { type: Date },
  tokens: [TokenSchema],
});

UserSchema.add(PermissionHolderDef);

// Options
UserSchema.set('toJSON', {
  transform: (doc, ret) => _.omit(ret, ['password'])
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
UserSchema.methods.generateToken = async function(req: Request) {
  // Tags
  const tags: string[] = [];
  const ua = req.headers['user-agent'];

  if (ua && /PostmanRuntime\/([0-9]+.?)+/.test(ua)) {
    tags.push("Postman");
  }

  // Generate new token
  const token = this.tokens.create({
    token: generateToken({ _id: this.id, date: moment().toISOString() }),
    from: req.ip, tags
  });

  // Store and return
  this.tokens.push(token);
  return token;
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