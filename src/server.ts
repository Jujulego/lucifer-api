import "reflect-metadata";
import http from 'http';

import app from 'app';
import * as db from 'db';
import env from 'env';
import DIContainer, { loadServices } from 'inversify.config';

import LoggerService from 'services/logger.service';

// Starter
(async () => {
  // Load modules
  loadServices();
  const logger = DIContainer.get(LoggerService);

  // Connect to database
  await db.connect();

  // Configure server
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Server listening at http://localhost:${env.PORT}/`);
  });
})();
