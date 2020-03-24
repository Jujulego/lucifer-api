import mongoose from 'mongoose';

import { Daemon } from './daemon';
import DaemonSchema from './daemon.schema';

// Model
const DaemonModel = mongoose.model<Daemon>('Daemon', DaemonSchema);

export default DaemonModel;
