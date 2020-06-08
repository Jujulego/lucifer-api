import { Module } from '@nestjs/common';

import { ApiController } from 'api.controller';
import { DatabaseModule } from 'database.module';
import { AuthModule } from 'auth/auth.module';
import { DaemonsModule } from 'daemons/daemons.module';
import { UsersModule } from 'users/users.module';

// Module
@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    DaemonsModule,
    UsersModule
  ],
  controllers: [ApiController]
})
export class AppModule {}
