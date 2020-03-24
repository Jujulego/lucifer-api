import { Schema } from 'mongoose';

import { Permission } from './permission';

// Schema
const PermissionSchema = new Schema<Permission>({
  name: { type: String, required: true },
  level: { type: Number, required: true }
});

export default PermissionSchema;
