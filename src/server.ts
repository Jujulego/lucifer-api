import http from 'http';

import app from 'app';
import env from 'env';

// Configure server
const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server listening at http://localhost:${env.PORT}/`);
});