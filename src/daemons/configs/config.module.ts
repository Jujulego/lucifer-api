import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigRegistry } from './registry.entity';
import { DockerConfig } from './docker.entity';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';

// Module
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConfigRegistry,
      DockerConfig
    ])
  ],
  providers: [ConfigService],
  controllers: [ConfigController]
})
export class DaemonConfigModule {}
