import { Schema, Types } from 'mongoose';

import { isCStatus } from './container.enum';
import { Container } from './container';
import { buildLRN } from 'utils';

// Schema
const ContainerSchema = new Schema<Container>({
  image: { type: String, required: true },
  status: { type: String, default: 'stopped', validate: isCStatus },
  owner: { type: Types.ObjectId, required: true },
  daemon: { type: Types.ObjectId, default: null }
});

// Virtuals
ContainerSchema.virtual('lrn').get(function (this: Container) {
  return buildLRN({ type: 'container', id: this.id });
});

// Options
ContainerSchema.set('toJSON', {
  virtuals: true
});

export default ContainerSchema;
