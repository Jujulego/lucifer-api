import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';

import { env } from 'env';

// Utils
function toWebpack(paths: any[] = []) {
  for (let i = 0; i < paths.length; ++i) {
    const p = paths[i];

    if (typeof p === 'string') {
      paths[i] = `dist/${p.replace(/.ts$/, '.js')}`;
    }
  }
}

// Module
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        let options: TypeOrmModuleOptions = {
          type: 'postgres',
          url: env.DATABASE_URL,
          entities: ["src/**/*.entity.ts"],
          migrations: ["db/migrations/*.ts"],
          autoLoadEntities: true,
        };

        if (!env.DATABASE_URL) {
          options = await getConnectionOptions();
        }

        if (!env.TESTS) {
          toWebpack(options.entities);
          toWebpack(options.migrations);
        }

        return options;
      }
    })
  ]
})
export class DatabaseModule {}
