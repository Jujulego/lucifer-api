import { injectable } from 'inversify';
import { Namespace } from 'socket.io';

import Event from 'data/event';

// Service
@injectable()
class ApiEventService {
  // Attributes
  private io?: Namespace;

  // Methods
  register(io: Namespace) {
    this.io = io;
  }

  emit(event: Event, room?: string) {
    if (!this.io) return;
    this.io.to(room || event.target).emit('event', event);
  }
}

export default ApiEventService;
