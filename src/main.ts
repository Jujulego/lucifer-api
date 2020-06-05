import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cors from 'cors';
import helmet from 'helmet';

import { AppModule } from 'app.module';
import { env } from 'env';
import morgan from 'morgan';

// Bootstrap
(async function () {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Morgan');

  // Middlewares
  app.use(helmet());
  app.use(cors());

  app.use(morgan('dev', {
    stream: {
      write(log: string) {
        logger.log(log);
      }
    }
  }));

  // Start server
  await app.listen(env.PORT);

  // Stop server
  process.on('SIGINT', async () => {
    await app.close();
  });
})();
