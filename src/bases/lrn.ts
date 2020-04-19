// Constants
const PART_RE = /([a-z0-9-]+):([a-f0-9]{24})/i

// Class
class LRN {
  // Attributes
  parent?: LRN;
  resource: string;
  id: string;

  // Constructor
  constructor(resource: string, id: string, parent?: LRN) {
    this.parent = parent;
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

  private static build(parts: string[]): LRN {
    const [resource, id] = parts[0].split(':');

    if (parts.length === 1) {
      return new LRN(resource, id);
    } else {
      return new LRN(resource, id, this.build(parts.slice(1)));
    }
  }

  // Methods
  public toString(): string {
    const base = this.parent?.toString() || 'lrn';
    return `${base}::${this.resource}:${this.id}`;
  }
}

export default LRN;
