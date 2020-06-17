import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { env } from 'env';

import { ConfigService } from './config.service';
import { DaemonConfigType } from './config.entity';

// Controller
@Controller('/api/daemons/:id/config')
@UseGuards(AuthGuard(env.AUTH_STRATEGY))
export class ConfigController {
  // Constructor
  constructor(
    private configs: ConfigService
  ) {}

  // Endpoints
  @Get('/types')
  getTypes(): DaemonConfigType[] {
    return this.configs.allowedTypes();
  }
}
