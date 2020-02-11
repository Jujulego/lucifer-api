import http from 'http';

import app from 'app';
import db from 'db';
import env from 'env';

(async () => {
  // Connect to database
  await db.connect();

  // Configure server
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Server listening at http://localhost:${env.PORT}/`);
  });
})();