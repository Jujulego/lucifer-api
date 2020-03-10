import { Server } from 'http';
import SocketIO from 'socket.io';

import { wsauth } from 'middlewares/auth';

import Daemons from 'controllers/daemons';
import Users from 'controllers/users';

// App
async function wsapp(server: Server) {
  // Setup websocket app
  const io = SocketIO(server).of('/api');

  // Register controllers
  Daemons.register(io);
  Users.register(io);

  // Middlewares
  io.use(wsauth);
}

export default wsapp;
