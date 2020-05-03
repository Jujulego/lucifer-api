import { json, toJSON } from 'utils';

// Constants
const PART_RE = /([a-z0-9-]+):([a-f0-9-]+)/i

// Interface
export interface ILRN {
  parent?: ILRN;
  resource: string;
  id: string;
}

// Class
export class LRN implements ILRN {
  // Attributes
  @json() parent?: LRN;
  @json() resource: string;
  @json() id: string;

  // Constructor
  constructor(resource: string, id: string, parent?: ILRN) {
    if (parent) {
      if (parent instanceof LRN) {
        this.parent = parent;
      } else {
        this.parent = new LRN(parent.resource, parent.id, parent.parent);
      }
    }

    this.resource = resource;
    this.id = id;
  }

  // Class methods
  public static isLRN(lrn: string): boolean {
    if (!lrn) return false;

    // Check
    const parts = lrn.split('::');
    if (parts.length < 2) return false;

    return parts.every((p, i) => {
      if (i === 0) return p === 'lrn';
      return PART_RE.test(p);
    });
  }

  public static parse(lrn: string): LRN {
    // Check
    if (!this.isLRN(lrn)) throw new Error(`Invalid LRN: ${lrn}`);

    // Parse it
    const parts = lrn.split('::').slice(1);
    return this.build(parts);
  }

  private static build(parts: string[], parent?: LRN): LRN {
    const [resource, id] = parts[0].split(':');

    if (parts.length === 1) {
      return new LRN(resource, id, parent);
    } else {
      return this.build(parts.slice(1), new LRN(resource, id, parent));
    }
  }

  // Methods
  private parts(): string[] {
    let part = `${this.resource}:${this.id}`;

    if (this.parent) {
      const parts = this.parent.parts();
      parts.push(part);

      return parts;
    } else {
      return [part];
    }
  }

  toString(): string {
    return `lrn::${this.parts().join('::')}`;
  }

  toJSON(): ILRN {
    return toJSON<ILRN>(this);
  }
}
