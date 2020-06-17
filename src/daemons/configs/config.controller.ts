import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { DaemonConfig, DaemonConfigType } from './config.entity';
import { RegistryService } from './registry.service';

// Controller
@Controller('/api/daemons/:daemonId/config')
@UseGuards(AuthGuard(env.AUTH_STRATEGY))
export class ConfigController {
  // Constructor
  constructor(
    private registry: RegistryService
  ) {}

  // Endpoints
  @Get('/types')
  getTypes(): DaemonConfigType[] {
    return this.registry.allowedTypes();
  }

  @Get('/')
  async getConfig(@Param('daemonId') daemonId: string): Promise<DaemonConfig | null> {
    return await this.registry.getConfig(daemonId);
  }
}
