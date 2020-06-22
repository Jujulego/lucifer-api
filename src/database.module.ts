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
        let options: TypeOrmModuleOptions;
        options.autoLoadEntities = true;

        if (env.DATABASE_URL) {
          Object.assign(options, { url: env.DATABASE_URL });
        } else {
          options = await getConnectionOptions();
        }

        if (!env.TESTS) {
          toWebpack(options.entities);
          toWebpack(options.migrations);
        }

        console.log(options);

        return options;
      }
    })
  ]
})
export class DatabaseModule {}
