import { Document, Types } from 'mongoose';

// Enums
export type PName = "users" | "permissions";
export const PERMISSIONS: PName[] = [
  "users", "permissions"
];

export enum PLvl {
  NONE   = 0b0000,
  CREATE = 0b1000,
  READ   = 0b0100,
  UPDATE = 0b0010,
  DELETE = 0b0001,

  ALL = CREATE | READ | UPDATE | DELETE,
}
export const LEVELS: Array<keyof typeof PLvl> = [
  'CREATE', 'READ', 'UPDATE', 'DELETE'
];

// Interface
interface Permission extends Document {
  // Attributes
  name: PName;
  level: PLvl;
}

// Types
export interface PermissionHolder extends Document {
  admin: boolean;
  readonly permissions: Types.DocumentArray<Permission>;
}

// Utils
export function isPName(str: string): str is PName {
  return PERMISSIONS.find(name => name === str) != undefined;
}

export function isAllowed(holder: PermissionHolder, name: PName, level: PLvl): boolean {
  // Admins always pass
  if (holder.admin) return true;

  // Find permission
  const permission = holder.permissions.find(perm => perm.name === name);
  if (!permission) return false;

  // Check level
  return (permission.level & level) === level;
}

export default Permission;