import { Schema, Types } from 'mongoose';

import { isCStatus } from './container.enum';
import { Container } from './container';
import { buildLRN } from 'utils';

// Schema
const ContainerSchema = new Schema<Container>({
  image: { type: String },
  daemon: { type: Types.ObjectId },
  status: { type: String, default: 'stopped', validate: isCStatus }
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
