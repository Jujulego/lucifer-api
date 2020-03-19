import { Document, SchemaDefinition, Types } from 'mongoose';

import { Token } from './token.types';
import TokenSchema from './token.schema';

// Type
interface TokenHolder extends Document {
  // Attributes
  lastConnexion?: Date;
  readonly tokens: Types.DocumentArray<Token>;
}

// Schema definitions
export const TokenHolderDef: SchemaDefinition = {
  lastConnexion: { type: Date },
  tokens: [TokenSchema],
};

export default TokenHolder;
