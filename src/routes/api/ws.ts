import { Namespace } from 'socket.io';

import { wsauth } from 'middlewares/auth';
import { HttpError } from 'middlewares/errors';

import Daemons from 'controllers/daemons';
import Users from 'controllers/users';

import { isAllowed, PLvl } from 'data/permission';

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
      sock.on('register', async (room) => {
        // Get current user
        const user = await sock.user();

        // Try to join room
        switch (room) {
          case 'users':
          case 'daemons':
            if (!isAllowed(user, room, PLvl.READ)) {
              throw HttpError.Forbidden();
            }
            sock.join(room);

            break;

          default:
            throw HttpError.NotFound(`Unknown room: ${room}`);
        }
      });

      sock.on('unregister', (room) => {
        // Leave room
        switch (room) {
          case 'users':
          case 'daemons':
            sock.leave(room);
            break;

          default:
            throw HttpError.NotFound(`Unknown room: ${room}`);
        }
      });

    } catch (error) {
      console.error(error);
      sock.error(error);
    }
  });
}

export default wsapi;
