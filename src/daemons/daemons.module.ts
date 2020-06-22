import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'users/users.module';

import { Daemon } from './daemon.entity';
import { ConfigRegistry } from './configs/registry.entity';
import { DockerConfig } from './configs/docker.entity';
import { DaemonService } from './daemon.service';
import { RegistryService } from './configs/registry.service';
import { DockerService } from './configs/docker.service';
import { DaemonController } from './daemon.controller';
import { RegistryController } from 'daemons/configs/registry.controller';

// Modules
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([
      Daemon,
      ConfigRegistry,
      DockerConfig
    ])
  ],
  providers: [
    DaemonService,
    RegistryService,
    DockerService
  ],
  controllers: [
    DaemonController,
    RegistryController
  ]
})
export class DaemonsModule {}
