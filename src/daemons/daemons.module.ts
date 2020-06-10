import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from 'users/users.module';

import { Daemon } from './daemon.entity';
import { DaemonService } from './daemon.service';
import { DaemonInterceptor } from './daemon.interceptor';
import { DaemonController } from './daemon.controller';

// Modules
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([Daemon])
  ],
  providers: [
    DaemonService,
    DaemonInterceptor
  ],
  controllers: [
    DaemonController
  ]
})
export class DaemonsModule {}
