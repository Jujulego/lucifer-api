import { Schema, SchemaDefinition } from 'mongoose';

import Permission from 'data/permission';

// Schema
const PermissionSchema = new Schema<Permission>({
  name: { type: String, required: true },
  level: { type: Number, required: true }
});

// Schema definitions
export const PermissionHolderDef: SchemaDefinition = {
  admin: { type: Boolean, default: false },
  permissions: [PermissionSchema],
};

export default PermissionSchema;