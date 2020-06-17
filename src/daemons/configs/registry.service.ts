import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DaemonConfig, DaemonConfigType } from './config.entity';
import { ConfigRegistry } from './registry.entity';
import { DockerService } from './docker.service';
import { CreateConfig } from './config.schema';
import { DaemonService } from 'daemons/daemon.service';

// Service
@Injectable()
export class RegistryService {
  // Constructor
  constructor(
    private daemons: DaemonService,
    private docker: DockerService,
    @InjectRepository(ConfigRegistry) private registry: Repository<ConfigRegistry>
  ) {}

  // Methods
  allowedTypes(): DaemonConfigType[] {
    return ['docker'];
  }

  async createConfig(daemonId: string, data: CreateConfig): Promise<DaemonConfig> {
    // Get daemon
    const daemon = await this.daemons.get(daemonId);
    const entry = this.registry.create({ daemon });

    // Create config
    let config: DaemonConfig;

    switch (data.type) {
      case 'docker':
        config = entry.docker = await this.docker.create();
        break;

      default:
        throw new BadRequestException(`Invalid configuration type: ${data.type}`);
    }

    // Link both
    await this.registry.save(entry);

    return config;
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
