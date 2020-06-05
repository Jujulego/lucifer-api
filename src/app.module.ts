import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import cors from 'cors';
import helmet from 'helmet';

import { ApiController } from 'api.controller';
import { MorganInterceptor } from 'morgan.interceptor';
import { DaemonsModule } from 'daemons/daemons.module';
import { UsersModule } from 'users/users.module';

// Module
@Module({
  imports: [
    DaemonsModule,
    UsersModule,
    TypeOrmModule.forRoot()
  ],
  controllers: [ApiController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: MorganInterceptor }
  ]
})
export class AppModule implements NestModule {
  // Methods
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(helmet(), cors()).forRoutes('/api/(.*)');
  }
}
