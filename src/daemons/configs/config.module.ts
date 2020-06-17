import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigRegistry } from './registry.entity';
import { RegistryService } from './registry.service';
import { DockerConfig } from './docker.entity';
import { DockerService } from './docker.service';
import { ConfigController } from './config.controller';

// Module
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfigRegistry,
      DockerConfig
    ])
  ],
  providers: [
    RegistryService,
    DockerService
  ],
  controllers: [ConfigController]
})
export class DaemonConfigModule {}
