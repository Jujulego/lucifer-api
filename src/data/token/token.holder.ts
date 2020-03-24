import { Document, SchemaDefinition, Types } from 'mongoose';

import { Token } from './token';
import TokenSchema from './token.schema';

// Interface
interface TokenHolder extends Document {
  // Attributes
  lastConnexion?: Date;
  readonly tokens: Types.DocumentArray<Token>;
}

// Schema definition
export const TokenHolderDef: SchemaDefinition = {
  lastConnexion: { type: Date },
  tokens: [TokenSchema],
};

export default TokenHolder;
