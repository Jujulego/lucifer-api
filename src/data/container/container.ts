import { Document, Types } from 'mongoose';

import { CStatus } from './container.enum';

// Interface
export interface Container extends Document {
  // Attributes
  image: string;
  status: CStatus;
  owner: Types.ObjectId;
  daemon?: Types.ObjectId;

  readonly lrn: string;
}

// Types
export type ContainerFilter = Partial<Pick<Container, 'image' | 'daemon' | 'owner' | 'status'>>;

export type ContainerCreate = Pick<Container, 'image' | 'daemon' | 'owner'>;
export type ContainerUpdate = Partial<Pick<Container, 'image' | 'daemon' | 'owner' | 'status'>>;
