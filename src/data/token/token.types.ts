import { Document } from 'mongoose';

// Interface
export interface Token extends Document {
  // Attributes
  readonly token: string;

  readonly from: string;
  readonly tags: string[];
  readonly createdAt: Date;
}

// Types
export type TokenContent = string | object;
