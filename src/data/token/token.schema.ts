import { Schema } from 'mongoose';
import validator from 'validator';
import _ from 'lodash';

import { Token } from './token';

// Schema
const TokenSchema = new Schema<Token>({
  token: { type: String, required: true, unique: true, sparse: true },
  from: { type: String, default: '0.0.0.0', validate: validator.isIP },
  tags: [{ type: String }]
});

// Options
TokenSchema.set('timestamps', {
  createdAt: true,
  updatedAt: false
});

TokenSchema.set('toJSON', {
  transform: (doc, ret) => _.omit(ret, ["token"])
});

export default TokenSchema;
