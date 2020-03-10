import { Document } from 'mongoose';
import { Namespace } from 'socket.io';

import Event, { DataEvent } from 'data/event';

// Class
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

export abstract class DataEmitter<T extends Document> extends Emitter {
  // Abstract methods
  protected getTargets(data: T): string[] {
    return [];
  }

  // Methods
  emitData(kind: DataEvent["kind"], data: T, target?: string[]): T {
    const targets = this.getTargets(data);
    if (target) targets.push(...target);

    targets.forEach(target => {
      this.emit({ target, kind, id: data._id, value: data });
    });

    return data;
  }

  emitCreate(data: T, target?: string[]): T {
    return this.emitData('create', data, target);
  }

  emitUpdate(data: T, target?: string[]): T {
    return this.emitData('update', data, target);
  }

  emitDelete(data: T, target?: string[]): T {
    return this.emitData('delete', data, target);
  }
}

export default Emitter;
