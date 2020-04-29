import { ValueTransformer } from 'typeorm';

// Transformers
export const lowercase: ValueTransformer = {
  to(value: string): string {
    return value.toLowerCase();
  },

  from(value: string): string {
    return value;
  },
}
