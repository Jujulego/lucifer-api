import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { DaemonConfig, DaemonConfigType } from './config.entity';
import { CreateConfig } from './config.schema';
import { RegistryService } from './registry.service';

// Controller
@Controller('/api/daemons/:daemonId/config')
@UseGuards(AuthGuard(env.AUTH_STRATEGY))
export class RegistryController {
  // Constructor
  constructor(
    private registry: RegistryService
  ) {}

  // Endpoints
  @Get('/types')
  getTypes(): DaemonConfigType[] {
    return this.registry.allowedTypes();
  }

  @Post('/')
  async createConfig(
    @Param('daemonId', ParseUUIDPipe) daemonId: string,
    @Body(ValidationPipe) data: CreateConfig
  ): Promise<DaemonConfig> {
    return await this.registry.createConfig(daemonId, data);
  }

  @Get('/')
  async getConfig(@Param('daemonId', ParseUUIDPipe) daemonId: string): Promise<DaemonConfig | null> {
    return await this.registry.getConfig(daemonId);
  }

  @Put('/')
  async updateConfig(
    @Param('daemonId', ParseUUIDPipe) daemonId: string,
    @Body() data: any
  ): Promise<DaemonConfig> {
    return await this.registry.updateConfig(daemonId, data);
  }
}
