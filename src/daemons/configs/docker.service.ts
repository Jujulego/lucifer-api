import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DockerConfig } from './docker.entity';

// Service
@Injectable()
export class DockerService {
  // Constructor
  constructor(
    @InjectRepository(DockerConfig) private repository: Repository<DockerConfig>
  ) {}

  // Methods
  async create(): Promise<DockerConfig> {
    const config = this.repository.create();
    return await this.repository.save(config);
  }

  async get(id: string): Promise<DockerConfig> {
    const config = await this.repository.findOne(id);

    if (!config) {
      throw new NotFoundException(`Configuration ${id} not found`);
    }

    return config;
  }
}
