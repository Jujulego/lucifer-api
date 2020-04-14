import mongoose from 'mongoose';

import { Container } from './container';
import ContainerSchema from './container.schema';

// Model
const ContainerModel = mongoose.model<Container>('Container', ContainerSchema);

export default ContainerModel;
