import { Document, SchemaDefinition, Types } from "mongoose";
import Permission from 'data/permission';
import PermissionSchema from 'schemas/permission';

// Interface
interface PermissionHolder extends Document {
  // Attributes
  admin: boolean;
  readonly permissions: Types.DocumentArray<Permission>;
}

// Schema definition
export const PermissionHolderDef: SchemaDefinition = {
  admin: { type: Boolean, default: false },
  permissions: [PermissionSchema],
};

export default PermissionHolder;
