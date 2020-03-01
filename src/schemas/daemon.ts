import { Request } from 'express';
import { Schema, Types } from 'mongoose';

import bcrypt from 'bcryptjs';
import { omit } from 'lodash';

import { generateToken } from 'data/token';
import Daemon, { Credentials, DaemonToken } from 'data/daemon';

import { PermissionHolderDef } from './permission';
import { TokenHolderDef } from './token';

// Schema
const DaemonSchema = new Schema<Daemon>({
  name: { type: String },
  secret: { type: String, required: true },
  user: { type: Types.ObjectId, required: true },
});

DaemonSchema.add(PermissionHolderDef);
DaemonSchema.add(TokenHolderDef);

// Options
DaemonSchema.set('toJSON', {
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

// Methods
DaemonSchema.methods.generateToken = async function (req: Request) {
  return generateToken(this, req, { _id: this.id } as DaemonToken, '7 days');
};

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
