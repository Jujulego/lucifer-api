import { Server } from 'http';
import SocketIO from 'socket.io';

import { wsauth } from 'middlewares/auth';

// App
async function wsapp(server: Server) {
  // Setup websocket app
  const io = SocketIO(server).of('/api');

  // Middlewares
  io.use(wsauth)
}

export default wsapp;
