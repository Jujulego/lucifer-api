import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigRegistry } from './registry.entity';
import { DaemonConfig } from './config.entity';
import { DockerConfig } from './docker.entity';

// Module
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfigRegistry,
      DaemonConfig,
      DockerConfig
    ])
  ]
})
export class DaemonConfigModule {}
