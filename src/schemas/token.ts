import { Schema } from 'mongoose';
import validator from 'validator';
import _ from 'lodash';

import Token from 'data/token';

// Schema
const TokenSchema = new Schema<Token>({
  token: { type: String, required: true, unique: true, sparse: true },
  from: { type: String, default: '0.0.0.0', validate: validator.isIP },
});

// Options
TokenSchema.set('timestamps', {
  createdAt: true,
  updatedAt: true
});

TokenSchema.set('toJSON', {
  transform: (doc, ret) => _.omit(ret, ["token"])
});

export default TokenSchema;