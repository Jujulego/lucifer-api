import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiController } from 'api.controller';
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
  providers: []
})
export class AppModule {}
