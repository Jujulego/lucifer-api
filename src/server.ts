import http from 'http';

import app from 'app';
import * as db from 'db';
import env from 'env';
import wsapp from 'wsapp';

(async () => {
  // Connect to database
  await db.connect();

  // Configure server
  const server = http.createServer(app);
  await wsapp(server);

  server.listen(env.PORT, () => {
    console.log(`Server listening at http://localhost:${env.PORT}/`);
  });
})();
