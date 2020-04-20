// Constants
const PART_RE = /([a-z0-9-]+):([a-f0-9]{24})/i

// Class
class LRN {
  // Attributes
  child?: LRN;
  resource: string;
  id: string;

  // Constructor
  constructor(resource: string, id: string, child?: LRN) {
    this.child = child;
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
  private part(): string {
    let part = `${this.resource}:${this.id}`;

    if (this.child) {
      part += this.child.part();
    }

    return part;
  }

  public toString(): string {
    return `lrn::${this.part()}`;
  }
}

export default LRN;
