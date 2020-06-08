import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';

// Module
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const options: TypeOrmModuleOptions = await getConnectionOptions();
        options.autoLoadEntities = true;

        return options;
      }
    })
  ]
})
export class DatabaseModule {}
