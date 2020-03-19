import { Namespace } from 'socket.io';

import { fromSocket } from 'bases/context';
import DIContainer from 'inversify.config';
import { parseLRN } from 'utils/lrn';

import { wsauth } from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';

import DaemonsController from 'controllers/daemons';
import UsersController from 'controllers/users';

// Containers
const Daemons = DIContainer.get(DaemonsController);
const Users = DIContainer.get(UsersController);

// Websocket namespace api
function wsapi(io: Namespace) {
  // Register controllers
  Daemons.register(io);
  Users.register(io);

  // Middlewares
  io.use(wsauth);

  // Events
  io.on('connection', (sock) => {
    try {
      // Personal room
      sock.user().then(user => sock.join(user.id));

      // Events
      sock.on('register', async (room: string) => {
        // Try to join room
        const ctx = fromSocket(sock);
        const lrn = parseLRN(room);

        if (room === 'users' || lrn?.type === 'user') {
          await Users.canJoinRoom(ctx, room);
          sock.join(room);
        } else if (room === 'daemons' || lrn?.type === 'daemon') {
          await Daemons.canJoinRoom(ctx, room);
          sock.join(room);
        } else {
          throw HttpError.NotFound(`Unknown room: ${room}`);
        }
      });

      sock.on('unregister', (room) => {
        // Leave room
        sock.leave(room);
      });

    } catch (error) {
      console.error(error);
      sock.error(error);
    }
  });
}

export default wsapi;
