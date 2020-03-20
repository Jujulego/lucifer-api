import { Document } from 'mongoose';

import { PLvl, PName } from './permission.enums';

// Interface
export interface Permission extends Document {
  // Attributes
  name: PName;
  level: PLvl;
}
