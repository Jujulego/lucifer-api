import 'reflect-metadata';
import http from 'http';

import { app } from 'app';
import { env } from 'env';
import { DIContainer, loadServices } from 'inversify.config';

import { DatabaseService } from 'db.service';
import { LoggerService } from 'logger.service';

// Starter
(async (): Promise<void> => {
  // Load services
  loadServices();

  const logger = DIContainer.get(LoggerService);
  const database = DIContainer.get(DatabaseService);

  // Connect to database
  await database.connect();

  // Configure server
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Server listening at http://localhost:${env.PORT}/`);
  });

  // Stop server
  process.on('SIGINT', async () => {
    await new Promise(resolve => server.close(resolve));
    await database.disconnect();
  });
})();
