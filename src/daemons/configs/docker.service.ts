import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DockerConfig } from './docker.entity';
import { DockerSchema } from './docker.schema';

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

  async update(id: string, update: DockerSchema): Promise<DockerConfig> {
    const config = await this.get(id);

    if (!config.env) {
      config.env = {};
    }

    // Apply update
    if (update.image) config.image = update.image;
    if (update.env) config.env = Object.assign(config.env, update.env);

    return await this.repository.save(config);
  }
}
