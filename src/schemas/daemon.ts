import { Request } from 'express';
import { Schema } from 'mongoose';

import bcrypt from 'bcryptjs';
import { omit } from 'lodash';

import { generateToken } from 'data/token';
import Daemon, { Credentials, DaemonToken } from 'data/daemon';

import { PermissionHolderDef } from './permission';
import TokenSchema from './token';

// Schema
const DaemonSchema = new Schema<Daemon>({
  name: { type: String },
  secret: { type: String, required: true },
  lastConnexion: { type: Date },
  tokens: [TokenSchema],
});

DaemonSchema.add(PermissionHolderDef);

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
  // Tags
  const tags: string[] = [];
  const ua = req.headers['user-agent'];

  if (ua && /PostmanRuntime\/([0-9]+.?)+/.test(ua)) {
    tags.push("Postman");
  }

  // Generate new token
  const token = this.tokens.create({
    token: generateToken({ _id: this.id } as DaemonToken, '7 days'),
    from: req.ip, tags
  });

  // Store and return
  this.tokens.push(token);
  return token;
};

// Statics
DaemonSchema.statics.findByCredentials = async function(cred: Credentials) {
  // Search by name
  const daemon = await this.findOne({ _id: cred._id });
  if (!daemon) return null;

  // Check secret
  const match = await bcrypt.compare(cred.secret, daemon.secret);
  if (!match) return null;

  return daemon;
};

export default DaemonSchema
