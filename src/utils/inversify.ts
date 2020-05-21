import 'reflect-metadata';
import { ContainerModule, interfaces, decorate, injectable } from 'inversify';

import { ClassDecorator, Newable } from './types';

// Types
export interface ServiceOpts {
  singleton?: boolean;
}

type BindCallback = (bind: interfaces.Bind) => void;

// Constants
const METADATA_KEY = Symbol('utils.inversify:bind');
const services: Newable[] = [];

// Decorator factory
export function Service(opts: ServiceOpts = {}): ClassDecorator {
  // Options
  const { singleton = false } = opts;

  // Decorator
  return <T extends Newable> (target: T): T => {
    decorate(injectable(), target);

    // Prepare binding
    const cb = (bind: interfaces.Bind): void => {
      const binding = bind(target).toSelf();

      if (singleton) binding.inSingletonScope();
    }

    Reflect.defineMetadata(METADATA_KEY, cb, target);
    services.push(target);

    return target;
  }
}

// Utils
export function servicesModule(): ContainerModule {
  return new ContainerModule((bind, unbind, isBound) => {
    // Bind every services
    services.forEach(service => {
      if (!isBound(service)) {
        const cb = Reflect.getMetadata(METADATA_KEY, service) as BindCallback;
        cb(bind);
      }
    });
  });
}
