import ContainerModel from './container.model';
import { Container, ContainerFilter, ContainerCreate, ContainerUpdate } from './container';

// Repository
class ContainerRepository {
  // Methods
  async create(data: ContainerCreate): Promise<Container> {
    // Create container
    const container = new ContainerModel({
      image: data.image,
      owner: data.owner,
      daemon: data.daemon,
    });

    return await container.save();
  }

  async getById(id: string): Promise<Container | null> {
    return ContainerModel.findById(id);
  }

  async find(filter: ContainerFilter): Promise<Container[]> {
    return ContainerModel.find(filter);
  }

  async update(container: Container, update: ContainerUpdate): Promise<Container> {
    // Apply update
    if (update.image)  container.image  = update.image;
    if (update.status) container.status = update.status;
    if (update.owner)  container.owner  = update.owner;
    if (update.daemon) container.daemon = update.daemon;

    return await container.save();
  }

  async delete(id: string): Promise<Container | null> {
    return ContainerModel.findByIdAndDelete(id);
  }
}

export default ContainerRepository;
