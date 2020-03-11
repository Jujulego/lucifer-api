// Interfaces
export interface BaseDocument {
  readonly _id: string;
}

interface Document extends BaseDocument {
  readonly __v: number;
}

// Aliases
export type SubDocument = BaseDocument;
export type AnyDocument = BaseDocument & {
  [extra in string | number | symbol]: any;
}

// Utils
export function isDocument(doc: AnyDocument): doc is Document {
  return typeof doc.__v === 'number';
}

export default Document;
