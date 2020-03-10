import { Server } from 'http';
import SocketIO from 'socket.io';

import wsapi from 'routes/api/ws';

// App
async function wsapp(server: Server) {
  // Setup websocket app
  const io = SocketIO(server);

  // Namespaces
  wsapi(io.of('/api'))
}

export default wsapp;
