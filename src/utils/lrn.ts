// Constants
const LRN_RE = /lrn::([a-z0-9-]+):([a-f0-9]{24})/i;

// Types
export interface LRN {
  type: string;
  id: string;
}

// Utils
export function isLRN(str: string): boolean {
  return LRN_RE.test(str);
}

export function parseLRN(str: string): LRN | null {
  if (!LRN_RE.test(str)) return null;

  return {
    type: RegExp.$1,
    id: RegExp.$2,
  }
}

export function buildLRN(lrn: LRN): string {
  return `lrn::${lrn.type}:${lrn.id}`;
}
