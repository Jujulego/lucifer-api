import { Namespace } from 'socket.io';

import { fromSocket } from 'bases/context';
import { parseLRN } from 'utils/lrn';

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
      // Create context
      const ctx = fromSocket(sock);

      // Personal room
      sock.user().then(user => sock.join(user.id));

      // Events
      sock.on('register', async (room: string) => {
        // Get current user
        const user = await sock.user();

        // Try to join room
        const lrn = parseLRN(room);

        if (room === 'users' || lrn?.type === 'user') {
          await Users.canJoinRoom(ctx, room);
          sock.join(room);
        } else if (room === 'daemons') {
          if (!isAllowed(user, 'daemons', PLvl.READ)) throw HttpError.Forbidden();
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
