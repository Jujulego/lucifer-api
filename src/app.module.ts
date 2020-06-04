import { Module } from '@nestjs/common';

import { AppController } from 'app.controller';

// Module
@Module({
  imports: [],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
