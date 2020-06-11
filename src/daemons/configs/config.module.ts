import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigRegistry } from './registry.entity';
import { DockerConfig } from './docker.entity';

// Module
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfigRegistry,
      DockerConfig
    ])
  ]
})
export class DaemonConfigModule {}
