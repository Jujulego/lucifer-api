// Enums
export type CStatus = "started" | "paused" | "stopped";
export const C_STATUSES: CStatus[] = [
  "started", "paused", "stopped"
]

// Utils
export function isCStatus(str: string): str is CStatus {
  return C_STATUSES.find(status => status === str) != undefined;
}
