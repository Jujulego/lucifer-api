import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApiController } from 'api.controller';
import { UsersModule } from 'users/users.module';

// Module
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot()
  ],
  controllers: [ApiController],
  providers: []
})
export class AppModule {}
