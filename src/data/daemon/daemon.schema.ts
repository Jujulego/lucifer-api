import { Schema, Types } from 'mongoose';

import bcrypt from 'bcryptjs';
import { omit } from 'lodash';

import { PermissionHolderDef } from 'data/permission/permission.holder';
import { TokenHolderDef } from 'data/token/token.holder';

import { Daemon } from './daemon.types';

import { buildLRN } from 'utils/lrn';

// Schema
const DaemonSchema = new Schema<Daemon>({
  name: { type: String },
  secret: { type: String, required: true },
  user: { type: Types.ObjectId, required: true },
});

DaemonSchema.add(PermissionHolderDef);
DaemonSchema.add(TokenHolderDef);

// Virtuals
DaemonSchema.virtual('lrn').get(function (this: Daemon) {
  return buildLRN({ type: 'daemon', id: this.id });
});

// Options
DaemonSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => omit(ret, ['secret'])
});

// Events
DaemonSchema.pre<Daemon>('save', async function (next) {
  // Hash secret before saving
  if (this.isModified('secret')) {
    this.secret = await bcrypt.hash(this.secret, 8);
  }

  next();
});

export default DaemonSchema
