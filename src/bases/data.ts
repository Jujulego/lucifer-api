import { Document } from 'mongoose';

import { AnyDocument } from 'data/document';
import { DataEvent } from 'data/event';

import Emitter from './emitter';

// Types
type Format<T extends Document> = ((doc: T) => AnyDocument);
type Targets<T extends Document> = { [target: string]: Format<T> };

// Class
export abstract class DataEmitter<T extends Document> extends Emitter {
  // Protected methods
  protected getTargets(data: T): Targets<T> {
    return {};
  }

  // Methods
  emitData(kind: DataEvent["kind"], data: T, targets: Targets<T> = {}): T {
    targets = { ...this.getTargets(data), ...targets };

    Object.keys(targets).forEach(target => {
      const format = targets[target];
      this.emit({ target, kind, id: data._id, value: format(data) });
    });

    return data;
  }

  emitCreate(data: T, targets?: Targets<T>): T {
    return this.emitData('create', data, targets);
  }

  emitUpdate(data: T, targets?: Targets<T>): T {
    return this.emitData('update', data, targets);
  }

  emitDelete(data: T, targets?: Targets<T>): T {
    return this.emitData('delete', data, targets);
  }
}
