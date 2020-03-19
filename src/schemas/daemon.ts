import { Schema, Types } from 'mongoose';

import bcrypt from 'bcryptjs';
import { omit } from 'lodash';

import Daemon, { Credentials } from 'data/daemon';
import { TokenHolderDef } from 'data/token/token.holder';

import { PermissionHolderDef } from './permission';

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

// Statics
DaemonSchema.statics.findByCredentials = async function(cred: Credentials) {
  // Search by name
  const daemon = await this.findById(cred._id);
  if (!daemon) return null;

  // Check secret
  const match = await bcrypt.compare(cred.secret, daemon.secret);
  if (!match) return null;

  return daemon;
};

export default DaemonSchema
