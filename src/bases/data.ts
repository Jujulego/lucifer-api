import { injectable } from 'inversify';
import { Document } from 'mongoose';

import { AnyDocument } from 'data/document';
import { DataEvent } from 'data/event';

import ApiEventService from '../services/api-event.service';

// Types
type Format<T extends Document> = ((doc: T) => AnyDocument);
type Targets<T extends Document> = { [target: string]: Format<T> };

// Class
@injectable()
export abstract class DataEmitter<T extends Document> {
  // Constructor
  protected constructor(
    private apievents: ApiEventService
  ) {}

  // Protected methods
  protected getTargets(data: T): Targets<T> {
    return {};
  }

  // Methods
  emitData(kind: DataEvent["kind"], data: T, targets: Targets<T> = {}): T {
    targets = { ...this.getTargets(data), ...targets };

    Object.keys(targets).forEach(target => {
      const format = targets[target];
      this.apievents.emit({ target, kind, id: data._id, value: format(data) });
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
