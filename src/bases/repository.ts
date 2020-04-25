import { Document, Model } from 'mongoose';

// Type utils
export type AsObject<T extends Document> = Omit<T, Exclude<keyof Document, 'id' | '_id' | '__v'>>;

// Interface
export interface Repository<T extends Document> {
  // Attributes
  readonly model: Model<T>;
}
