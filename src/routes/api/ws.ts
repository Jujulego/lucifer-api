import { Namespace } from 'socket.io';

import { fromSocket } from 'bases/context';

import { wsauth } from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';

import ApiEventService from 'services/api-event.service';
import DaemonsService from 'services/daemons.service';
import UsersService from 'services/users.service';

import DIContainer from 'inversify.config';
import { parseLRN } from 'utils/lrn';

// Websocket namespace api
function wsapi(io: Namespace) {
  // Containers
  const APIEvent = DIContainer.get(ApiEventService);
  const Daemons = DIContainer.get(DaemonsService);
  const Users = DIContainer.get(UsersService);

  // Register
  APIEvent.register(io);

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
