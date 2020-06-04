import { Module } from '@nestjs/common';

import { ApiController } from 'api.controller';

// Module
@Module({
  imports: [],
  controllers: [ApiController],
  providers: []
})
export class AppModule {}
