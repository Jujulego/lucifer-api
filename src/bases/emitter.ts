import { Namespace } from 'socket.io';

import Event from 'data/event';
import { injectable } from 'inversify';

// Class
@injectable()
abstract class Emitter {
  // Attributes
  private io?: Namespace;

  // Methods
  register(io: Namespace) {
    this.io = io;
  }

  protected emit(event: Event, room?: string) {
    if (!this.io) return console.warn(`Unregistred emitter (${this.constructor.name}) emits events !`);
    this.io.to(room || event.target).emit('event', event);
  }
}

export default Emitter;
