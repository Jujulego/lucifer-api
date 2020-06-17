import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DockerConfig } from './docker.entity';

// Service
@Injectable()
export class DockerService {
  // Constructor
  constructor(
    @InjectRepository(DockerConfig) private configs: Repository<DockerConfig>
  ) {}

  // Methods
  async get(id: string): Promise<DockerConfig> {
    const config = await this.configs.findOne(id);

    if (!config) {
      throw new NotFoundException(`Configuration ${id} not found`);
    }

    return config;
  }
}
