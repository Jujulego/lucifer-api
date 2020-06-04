import { NestFactory } from '@nestjs/core';

import { AppModule } from 'app.module';
import { env } from 'env';

// Bootstrap
(async function () {
  const app = await NestFactory.create(AppModule);
  await app.listen(env.PORT);
})();
