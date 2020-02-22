import { Document, Types } from 'mongoose';

// Enums
export type PermissionName = string;
export enum PermissionLevel {
  NONE   = 0b0000,
  CREATE = 0b1000,
  READ   = 0b0100,
  UPDATE = 0b0010,
  DELETE = 0b0001,
}

// Interface
interface Permission extends Document {
  // Attributes
  name: PermissionName;
  level: PermissionLevel;
}

// Types
export interface PermissionHolder extends Document {
  admin: boolean;
  readonly permissions: Types.DocumentArray<Permission>;
}

// Utils
export function isAllowed(holder: PermissionHolder, name: PermissionName, level: PermissionLevel): boolean {
  // Admins always pass
  if (holder.admin) return true;

  // Find permission
  const permission = holder.permissions.find(perm => perm.name === name);
  if (!permission) return false;

  // Check level
  return (permission.level & level) === level;
}

export default Permission;