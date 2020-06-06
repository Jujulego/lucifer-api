import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';

import { ApiController } from 'api.controller';
import { AuthModule } from 'auth/auth.module';
import { DaemonsModule } from 'daemons/daemons.module';
import { UsersModule } from 'users/users.module';

// Module
@Module({
  imports: [
    AuthModule,
    DaemonsModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const options: TypeOrmModuleOptions = await getConnectionOptions();
        options.autoLoadEntities = true;

        return options;
      }
    })
  ],
  controllers: [ApiController],
  providers: []
})
export class AppModule {}