import mongoose, { Model } from 'mongoose';

import Daemon, { Credentials } from 'data/daemon';
import DaemonSchema from 'schemas/daemon';

// Interface
interface DaemonModel extends Model<Daemon> {
  // Methods
  findByCredentials(credentials: Credentials): Promise<Daemon | null>
}

// Model
const DaemonModel = mongoose.model<Daemon, DaemonModel>('Daemon', DaemonSchema);

export default DaemonModel;
