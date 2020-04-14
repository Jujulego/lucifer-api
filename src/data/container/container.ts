import { Document, Types } from 'mongoose';

import { CStatus } from './container.enum';

// Interface
export interface Container extends Document {
  // Attributes
  image: string;
  daemon: Types.ObjectId;
  status: CStatus;

  readonly lrn: string;
}

// Types
export type ContainerFilter = Partial<Pick<Container, 'image' | 'daemon' | 'status'>>;

export type ContainerCreate = Pick<Container, 'image' | 'daemon'>;
export type ContainerUpdate = Pick<Container, 'image' | 'daemon' | 'status'>;
