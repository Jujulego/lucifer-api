import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getConnectionOptions } from 'typeorm';

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
        const options = await getConnectionOptions() as TypeOrmModuleOptions;

        toWebpack(options.entities);
        toWebpack(options.migrations);
        options.autoLoadEntities = true;

        return options;
      }
    })
  ]
})
export class DatabaseModule {}
