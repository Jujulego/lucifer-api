import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DaemonConfig, DaemonConfigType } from './config.entity';
import { ConfigRegistry } from './registry.entity';
import { DockerService } from './docker.service';

// Service
@Injectable()
export class RegistryService {
  // Constructor
  constructor(
    private docker: DockerService,
    @InjectRepository(ConfigRegistry) private registry: Repository<ConfigRegistry>
  ) {}

  // Methods
  allowedTypes(): DaemonConfigType[] {
    return ['docker'];
  }

  async getConfig(daemonId: string): Promise<DaemonConfig | null> {
    const entry = await this.registry.findOne({
      daemon: { id: daemonId }
    });

    // No config ...
    if (!entry) return null;

    // Get config
    if (entry.dockerId) {
      return await this.docker.get(entry.dockerId);
    }

    return null;
  }
}
