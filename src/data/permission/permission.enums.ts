// Enums
export type PName = "containers" | "daemons" | "permissions" | "users";
export const PERMISSIONS: PName[] = [
  "daemons", "permissions", "users"
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

// Utils
export function isPName(str: string): str is PName {
  return PERMISSIONS.find(name => name === str) != undefined;
}

export function isPLvl(str: string): str is keyof typeof PLvl {
  return LEVELS.find(name => name === str) != undefined;
}
