import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { ApiController } from 'api.controller';
import { DatabaseModule } from 'database.module';
import { TransformInterceptor } from 'transform.interceptor';
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
  controllers: [ApiController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor }
  ]
})
export class AppModule {}
